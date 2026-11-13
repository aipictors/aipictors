"""VRM 1.0 を書き出す: blender -b dist/PictorChan_v1.0.blend -P 08_vrm.py -- <out.vrm>"""
import bpy, sys, os
OUT = os.path.abspath(sys.argv[sys.argv.index("--") + 1])
bpy.ops.preferences.addon_enable(module="bl_ext.blender_org.vrm")
rig = bpy.data.objects["PictorChan"]
ext = rig.data.vrm_addon_extension
ext.spec_version = "1.0"
v = ext.vrm1
m = v.meta
m.vrm_name = "ぴくたーちゃん / Pictor-chan"; m.version = "1.0"
a = m.authors.add(); a.value = "Aipictors"
m.copyright_information = "Aipictors"
m.avatar_permission = "everyone"; m.commercial_usage = "corporation"; m.credit_notation = "required"
m.allow_redistribution = True; m.modification = "allowModificationRedistribution"
m.allow_excessively_violent_usage = False; m.allow_excessively_sexual_usage = False
m.allow_political_or_religious_usage = False; m.allow_antisocial_or_hate_usage = False
HB = dict(hips="Hip", spine="Waist", chest="Spine01", upper_chest="Spine02", neck="NeckTwist01", head="Head", left_eye="L_Eye", right_eye="R_Eye")
for s, S in (("left", "L"), ("right", "R")):
    HB.update({f"{s}_shoulder": f"{S}_Clavicle", f"{s}_upper_arm": f"{S}_Upperarm", f"{s}_lower_arm": f"{S}_Forearm", f"{s}_hand": f"{S}_Hand",
               f"{s}_upper_leg": f"{S}_Thigh", f"{s}_lower_leg": f"{S}_Calf", f"{s}_foot": f"{S}_Foot", f"{s}_toes": f"{S}_ToeBase",
               f"{s}_thumb_metacarpal": f"{S}_Thumb1", f"{s}_thumb_proximal": f"{S}_Thumb2", f"{s}_thumb_distal": f"{S}_Thumb3"})
    for f, F in (("index", "Index"), ("middle", "Mid"), ("ring", "Ring"), ("little", "Pinky")):
        HB.update({f"{s}_{f}_proximal": f"{S}_{F}1", f"{s}_{f}_intermediate": f"{S}_{F}2", f"{s}_{f}_distal": f"{S}_{F}3"})
hb = v.humanoid.human_bones
for k, b in HB.items():
    assert b in rig.data.bones, b
    getattr(hb, k).node.bone_name = b
def bind(expr, key):
    b = expr.morph_target_binds.add()
    b.node.mesh_object_name = "Face"; b.index = key; b.weight = 1.0
    expr.is_binary = True          # 板を出し入れする作りなので、途中の値は使わない
P = v.expressions.preset
for name, key in (("blink", "Blink"), ("blink_left", "Blink_L"), ("blink_right", "Blink_R"), ("happy", "Joy"), ("sad", "Sorrow"), ("relaxed", "MouthClosed"), ("surprised", "Surprised"), ("aa", "MouthOpen")):
    bind(getattr(P, name), key)
c = v.expressions.custom.add(); c.custom_name = "fun"; bind(c, "Fun")
# 目を閉じる表情の間はまばたきを、口を描きかえる表情の間は口の形を重ねない
for e in (P.happy, P.sad, c): e.override_blink = "block"
for e in (P.sad, P.surprised, P.relaxed): e.override_mouth = "block"
v.look_at.type = "bone"
v.look_at.offset_from_head_bone = (0, 0.085, 0.12)      # 両目の間 (頭の骨の根元から。VRM の軸: Y 上・Z 前)
# 体の絵は JPEG にして軽くする (無劣化の PNG は textures/ に)
img = bpy.data.images["PictorChan_Body"]
jpg = os.path.join(os.path.dirname(os.path.abspath(__file__)), "work", "PictorChan_Body.jpg")
sc = bpy.context.scene; sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 95; sc.render.image_settings.color_mode = "RGB"
sc.view_settings.view_transform = "Standard"
img.save_render(jpg, scene=sc)
new = bpy.data.images.load(jpg); new.name = "PictorChan_Body_jpg"; new.pack()
for n in bpy.data.materials["PictorChan_Body"].node_tree.nodes:
    if n.type == "TEX_IMAGE": n.image = new
r = bpy.ops.export_scene.vrm(filepath=OUT, armature_object_name="PictorChan", ignore_warning=True)
print("VRM RESULT", r, os.path.getsize(OUT) if os.path.exists(OUT) else None)
