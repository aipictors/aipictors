"""仕上げ: 名前・NLA・点検をして配布用の .blend と textures/ を保存
blender -b work/model.blend -P 05_finalize.py -- <dist_dir>"""
import bpy, bmesh, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
DIST = os.path.abspath(sys.argv[sys.argv.index("--") + 1])
scene = bpy.context.scene
rig = bpy.data.objects["PictorChan"]; body = bpy.data.objects["Body"]; face = bpy.data.objects["Face"]
scene.name = "PictorChan"
for o in list(bpy.data.objects):
    if o.name.startswith("Preview"): bpy.data.objects.remove(o)
for w in list(bpy.data.worlds): bpy.data.worlds.remove(w)
for c in bpy.data.collections: c.name = "PictorChan"
# 点検
info = {}
for o in (body, face):
    bm = bmesh.new(); bm.from_mesh(o.data)
    info[o.name] = dict(verts=len(bm.verts), tris=sum(len(f.verts) - 2 for f in bm.faces),
                        boundary_edges=sum(1 for e in bm.edges if e.is_boundary), nonmanifold_edges=sum(1 for e in bm.edges if not e.is_manifold and not e.is_boundary),
                        loose_verts=sum(1 for v in bm.verts if not v.link_faces), zero_area_faces=sum(1 for f in bm.faces if f.calc_area() < 1e-12))
    if o is body:
        # 外向きかどうか: 体積の符号
        info[o.name]["signed_volume"] = round(bm.calc_volume(signed=True), 5)
    bm.free()
print("CHECK", json.dumps(info))
# 動き: NLA に 1 本ずつ置く (書き出しで全部出すため)。普段は消音して T ポーズのまま
set_action(rig, None)
ad = rig.animation_data
for t in list(ad.nla_tracks): ad.nla_tracks.remove(t)
acts = {}
for name in ["Idle", "Run", "Jump", "Fall", "Hurt"]:
    act = bpy.data.actions[name]
    tr = ad.nla_tracks.new(); tr.name = name
    st = tr.strips.new(name, 0, act); st.name = name
    try: st.action_slot = act.slots[0]
    except Exception as e: print("slot", e)
    tr.mute = True
    acts[name] = dict(frames=int(act.frame_range[1] - act.frame_range[0]), seconds=round((act.frame_range[1] - act.frame_range[0]) / scene.render.fps, 3))
print("ACTIONS", json.dumps(acts))
reset_pose(rig)
scene.frame_start = 0; scene.frame_end = 460; scene.frame_set(0)
rig.show_in_front = False
rig.data.display_type = "STICK"
# テクスチャを textures/ にも書き出す (blend には埋め込んだまま)
os.makedirs(DIST + "/textures", exist_ok=True)
for im in bpy.data.images:
    if im.name in ("PictorChan_Body", "PictorChan_Face"):
        p = f"{DIST}/textures/{im.name}.png"
        im.save(filepath=p) if False else im.save_render(p) if False else None
        old = im.filepath_raw; im.filepath_raw = p; im.file_format = "PNG"; im.save(); im.filepath_raw = old
        if not im.packed_file: im.pack()
        print("IMG", im.name, tuple(im.size), os.path.getsize(p))
for im in list(bpy.data.images):
    if im.users == 0 and im.name not in ("PictorChan_Body", "PictorChan_Face"): bpy.data.images.remove(im)
bpy.ops.outliner.orphans_purge(do_recursive=True) if False else None
print("BONES", json.dumps([b.name for b in rig.data.bones]))
print("KEYS", [k.name for k in face.data.shape_keys.key_blocks])
bpy.ops.wm.save_as_mainfile(filepath=f"{DIST}/PictorChan_v1.0.blend", compress=True)
