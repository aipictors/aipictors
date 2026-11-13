import bpy, math
from mathutils import Vector

def actions_fcurves(act):
    return act.layers[0].strips[0].channelbags[0].fcurves

def set_action(rig, act):
    if rig.animation_data is None:
        rig.animation_data_create()
    rig.animation_data.action = act
    if act is not None:
        rig.animation_data.action_slot = act.slots[0]

def reset_pose(rig):
    for pb in rig.pose.bones:
        pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)

def setup_render(scene, w, h, bg=(0.93, 0.95, 0.98), transparent=False, sun=True):
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = w; scene.render.resolution_y = h
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = "Standard"
    scene.render.film_transparent = transparent
    world = bpy.data.worlds.get("PreviewWorld") or bpy.data.worlds.new("PreviewWorld")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (*bg, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    scene.world = world
    if sun and "PreviewSun" not in bpy.data.objects:
        s = bpy.data.objects.new("PreviewSun", bpy.data.lights.new("PreviewSun", "SUN"))
        s.data.energy = 1.2
        s.data.use_shadow = False   # EEVEE の影は半透明の板の上で粗い升目になるので、確認用の絵では切る
        s.rotation_euler = (math.radians(55), 0, math.radians(25))
        scene.collection.objects.link(s)
    cam = bpy.data.objects.get("PreviewCam")
    if cam is None:
        cd = bpy.data.cameras.new("PreviewCam"); cd.type = "ORTHO"
        cam = bpy.data.objects.new("PreviewCam", cd)
        scene.collection.objects.link(cam)
    scene.camera = cam
    return cam

def aim(cam, center, angle_deg, dist=5.0, elev=0.0, ortho_scale=None):
    """angle 0 = front (camera at -Y looking +Y); positive = towards +X (character's left)"""
    a = math.radians(angle_deg)
    pos = Vector(center) + Vector((math.sin(a) * dist, -math.cos(a) * dist, elev * dist))
    cam.location = pos
    cam.rotation_euler = (Vector(center) - pos).to_track_quat("-Z", "Y").to_euler()
    if ortho_scale: cam.data.ortho_scale = ortho_scale

def save_png(arr, path):
    """arr: (H,W,3|4) float 0..1, row 0 = top"""
    import numpy as np
    h, w, c = arr.shape
    if c == 3:
        arr = np.concatenate([arr, np.ones((h, w, 1), arr.dtype)], axis=2)
    im = bpy.data.images.new("tmp_save", w, h, alpha=True)
    im.alpha_mode = "STRAIGHT"
    im.pixels.foreach_set(np.ascontiguousarray(arr[::-1]).astype(np.float32).ravel())
    im.filepath_raw = path; im.file_format = "PNG"; im.save()
    bpy.data.images.remove(im)

def load_png(path):
    import numpy as np
    im = bpy.data.images.load(path)
    w, h = im.size
    a = np.empty(w * h * 4, dtype=np.float32); im.pixels.foreach_get(a)
    bpy.data.images.remove(im)
    return a.reshape(h, w, 4)[::-1].copy()
