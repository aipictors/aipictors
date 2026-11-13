"""GLB / FBX を書き出す: blender -b dist/PictorChan_v1.0.blend -P 06_export.py -- <dist_dir> <web_src.glb>"""
import bpy, sys, os, math
argv = sys.argv[sys.argv.index("--") + 1 :]
DIST = os.path.abspath(argv[0]); WEB = os.path.abspath(argv[1])
rig = bpy.data.objects["PictorChan"]
def gltf(path, **kw):
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", export_yup=True, export_animations=True,
        export_animation_mode="ACTIONS", export_force_sampling=True, export_morph=True, export_morph_normal=False,
        export_morph_tangent=False, export_skins=True, export_apply=False, export_cameras=False, export_lights=False,
        export_image_format="JPEG", export_jpeg_quality=95,   # 体は JPEG (無劣化の PNG は textures/ に)。透明のある顔の板は PNG のまま
         export_optimize_animation_size=True, export_anim_slide_to_zero=True, **kw)
gltf(f"{DIST}/PictorChan_v1.0.glb")
print("GLB", os.path.getsize(f"{DIST}/PictorChan_v1.0.glb"))
# FBX: テクスチャは textures/ を相対参照
for im in bpy.data.images:
    if im.name in ("PictorChan_Body", "PictorChan_Face"):
        im.filepath = f"{DIST}/textures/{im.name}.png"
for t in rig.animation_data.nla_tracks: t.mute = False     # FBX は消音した段を出さないので、この時だけ戻す
bpy.ops.export_scene.fbx(filepath=f"{DIST}/PictorChan_v1.0.fbx", use_selection=False, object_types={"ARMATURE", "MESH"},
    add_leaf_bones=False, bake_anim=True, bake_anim_use_all_actions=False, bake_anim_use_nla_strips=True, bake_anim_use_all_bones=True,
    bake_anim_force_startend_keying=True, bake_anim_simplify_factor=0.0, path_mode="RELATIVE", embed_textures=False,
    mesh_smooth_type="FACE", use_mesh_modifiers=False, apply_scale_options="FBX_SCALE_ALL", axis_forward="-Z", axis_up="Y", use_armature_deform_only=False)
for t in rig.animation_data.nla_tracks: t.mute = True
print("FBX", os.path.getsize(f"{DIST}/PictorChan_v1.0.fbx"))
# web 用の元: Hurt を外し、小文字の名前にし、ゲームの向き (glTF の +X が正面) に根元を回す
ad = rig.animation_data
for t in list(ad.nla_tracks):
    if t.name == "Hurt": ad.nla_tracks.remove(t); bpy.data.actions.remove(bpy.data.actions["Hurt"])
    else:
        t.name = t.name.lower()
        for s in t.strips: s.name = s.name.lower(); s.action.name = s.action.name.lower()
rig.rotation_mode = "XYZ"; rig.rotation_euler = (0, 0, math.radians(90))
gltf(WEB)
print("WEBSRC", os.path.getsize(WEB))
