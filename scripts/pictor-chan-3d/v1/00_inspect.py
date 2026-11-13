import bpy, sys, math
from mathutils import Vector
argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, OUT = argv[0], argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
for o in list(bpy.data.objects):
    if o.name.startswith("Icosphere"):
        print("ICO", tuple(o.location), tuple(o.scale)); bpy.data.objects.remove(o)
rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
mesh = next(o for o in bpy.data.objects if o.type == "MESH")
print("RIG", tuple(rig.location), tuple(rig.rotation_euler), rig.rotation_mode, tuple(rig.rotation_quaternion), tuple(rig.scale))
print("MESH", tuple(mesh.location), tuple(mesh.rotation_euler), tuple(mesh.scale), mesh.parent, mesh.parent_type, [m.type for m in mesh.modifiers])
print("fps", bpy.context.scene.render.fps)
for n in ["BoneRoot","Hip","Pelvis","Head","FacialBone","L_Eye","R_Eye","L_Hand","L_Foot","L_Upperarm"]:
    b = rig.data.bones[n]
    print("BONE", n, "head", tuple(round(v,3) for v in b.head_local), "tail", tuple(round(v,3) for v in b.tail_local), "parent", b.parent.name if b.parent else None)
me = mesh.data
print("uv", [u.name for u in me.uv_layers], "attrs", [a.name for a in me.attributes], "shapekeys", me.shape_keys)
mat = me.materials[0]
for n in mat.node_tree.nodes: print("NODE", n.type, n.name)
bs = next(n for n in mat.node_tree.nodes if n.type=="BSDF_PRINCIPLED")
print("metal", bs.inputs["Metallic"].default_value, "rough", bs.inputs["Roughness"].default_value, [ (l.from_node.name,l.to_socket.name) for l in mat.node_tree.links])
img = bpy.data.images[0]
img.filepath_raw = OUT + "/body.png"; img.file_format="PNG"; img.save()
# vertex groups on head
rig.animation_data_create()
sc = bpy.context.scene
for act in bpy.data.actions:
    print("ACTION", act.name, tuple(act.frame_range), "slots", [s.name_display for s in act.slots], "layers", len(act.layers))
    cb = act.layers[0].strips[0].channelbags[0]
    locs = {}
    for fc in cb.fcurves:
        if fc.data_path.endswith("location"):
            vals = [k.co[1] for k in fc.keyframe_points]
            locs.setdefault(fc.data_path, []).append((fc.array_index, round(min(vals),3), round(max(vals),3)))
    print("  nfc", len(cb.fcurves), "nkeys", len(cb.fcurves[0].keyframe_points), "interp", cb.fcurves[0].keyframe_points[0].interpolation)
    for k,v in locs.items():
        if any(abs(a[2]-a[1])>0.002 for a in v): print("  LOC", k, v)
    scl = [fc.data_path for fc in cb.fcurves if fc.data_path.endswith("scale") and (max(k.co[1] for k in fc.keyframe_points)-min(k.co[1] for k in fc.keyframe_points))>0.001]
    print("  scale-animated", len(scl))
    rig.animation_data.action = act
    rig.animation_data.action_slot = act.slots[0]
    s,e = act.frame_range
    out=[]
    for f in range(int(s), int(e)+1, max(1,int((e-s)//8))):
        sc.frame_set(f)
        h = rig.matrix_world @ rig.pose.bones["Hip"].head
        r = rig.matrix_world @ rig.pose.bones["BoneRoot"].head
        out.append((f, round(h.x,3), round(h.y,3), round(h.z,3), round(r.x,3), round(r.z,3)))
    print("  hip f,x,y,z,rootx,rootz", out)
rig.animation_data.action = None
for pb in rig.pose.bones:
    pb.location=(0,0,0); pb.rotation_quaternion=(1,0,0,0); pb.scale=(1,1,1)
sc.frame_set(0)
dg = bpy.context.evaluated_depsgraph_get()
ev = mesh.evaluated_get(dg)
vs = [ev.matrix_world @ v.co for v in ev.data.vertices]
lo = Vector((min(p.x for p in vs), min(p.y for p in vs), min(p.z for p in vs)))
hi = Vector((max(p.x for p in vs), max(p.y for p in vs), max(p.z for p in vs)))
print("REST bounds", tuple(round(v,3) for v in lo), tuple(round(v,3) for v in hi))
# flat render head closeup
for m in bpy.data.materials:
    nt = m.node_tree
    tex = next(n for n in nt.nodes if n.type=="TEX_IMAGE")
    out = next(n for n in nt.nodes if n.type=="OUTPUT_MATERIAL")
    nt.links.new(tex.outputs[0], out.inputs[0])
sc.render.engine = "BLENDER_EEVEE"
sc.view_settings.view_transform = "Standard"
sc.render.resolution_x = 1200; sc.render.resolution_y = 1200
w = bpy.data.worlds.new("W"); sc.world = w
cd = bpy.data.cameras.new("C"); cd.type="ORTHO"; cam = bpy.data.objects.new("C", cd); sc.collection.objects.link(cam); sc.camera=cam
hb = rig.data.bones["Head"].head_local
print("HEAD", tuple(hb))
cz = float(argv[2]) if len(argv)>2 else hb.z+0.12
cd.ortho_scale = float(argv[3]) if len(argv)>3 else 0.5
cam.location = (3, 0, cz); cam.rotation_euler = (math.radians(90), 0, math.radians(90))
sc.render.filepath = OUT + "/head_front.png"; bpy.ops.render.render(write_still=True)
cd.ortho_scale = 1.1
cam.location = (3, 0, 0.45); sc.render.filepath = OUT + "/full_front.png"; bpy.ops.render.render(write_still=True)
cam.location = (0, -3, 0.45); cam.rotation_euler = (math.radians(90), 0, 0); sc.render.filepath = OUT + "/full_side.png"; bpy.ops.render.render(write_still=True)
