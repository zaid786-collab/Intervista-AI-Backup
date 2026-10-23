"""Convert the supplied office-worker FBX into a web-ready seated GLB asset.

Run from the repository root with Blender in background mode.  The pose is
deliberately baked into the exported model so the interview scene can be loaded
quickly in a browser and then layered with subtle live gestures.
"""

import bpy
import math
from mathutils import Euler

SOURCE = r"C:\Users\mayan\OneDrive\Desktop\CLASSES\Projects\intervis\frontend\public\assets\interviewer\untitled3.fbx"
OUTPUT = r"C:\Users\mayan\OneDrive\Desktop\CLASSES\Projects\intervis\frontend\public\assets\interviewer\office-worker-seated.glb"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE)

# Remove the camera, light, and cube bundled with the downloaded model.  The
# browser scene supplies its own lighting and office furniture.
for item in list(bpy.context.scene.objects):
    if item.type in {"CAMERA", "LIGHT"} or item.name == "Cube":
        bpy.data.objects.remove(item, do_unlink=True)

armature = next(item for item in bpy.context.scene.objects if item.type == "ARMATURE")
bpy.context.view_layer.objects.active = armature
armature.select_set(True)
bpy.ops.object.mode_set(mode="POSE")

def pose(bone_name, x=0, y=0, z=0):
    bone = armature.pose.bones.get(bone_name)
    if bone:
        bone.rotation_mode = "XYZ"
        bone.rotation_euler = Euler((math.radians(x), math.radians(y), math.radians(z)), "XYZ")

# A relaxed seated interviewer posture: hips settle into the chair, legs bend
# beneath the desk, shoulders soften, and hands rest forward on the desktop.
pose("Hips", -8, 0, 0)
pose("Spine", -5, 0, 0)
pose("Spine1", 5, 0, 0)
pose("Spine2", 4, 0, 0)
pose("Neck", 2, 0, 0)
pose("Head", 0, 0, 0)

pose("LeftUpLeg", -87, 5, 3)
pose("RightUpLeg", -87, -5, -3)
pose("LeftLeg", 92, 0, 0)
pose("RightLeg", 92, 0, 0)
pose("LeftFoot", -5, 0, 0)
pose("RightFoot", -5, 0, 0)

pose("LeftShoulder", 8, 0, 12)
pose("RightShoulder", 8, 0, -12)
pose("LeftArm", 44, 5, 14)
pose("RightArm", 44, -5, -14)
pose("LeftForeArm", 70, 0, 0)
pose("RightForeArm", 70, 0, 0)
pose("LeftHand", 10, 10, 5)
pose("RightHand", 10, -10, -5)

# Bake the visual pose into a one-frame animation. This retains the source
# rig's exact bone axes when the GLB is played by Three.js (more robust than
# trying to reproduce FBX rotations in the browser).
bpy.context.scene.frame_set(1)
bpy.ops.nla.bake(
    frame_start=1,
    frame_end=1,
    only_selected=False,
    visual_keying=True,
    clear_constraints=False,
    clear_parents=False,
    use_current_action=True,
    bake_types={"POSE"},
)
bpy.ops.object.mode_set(mode="OBJECT")

# Center and scale for a meter-based Three.js office.  The source imports at
# human scale; keeping transforms clean makes positioning deterministic.
armature.location = (0, 0, 0)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUTPUT,
    export_format="GLB",
    export_yup=True,
    export_apply=True,
    export_materials="EXPORT",
    export_lights=False,
    export_cameras=False,
)
