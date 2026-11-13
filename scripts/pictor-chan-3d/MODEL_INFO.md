# ぴくたーちゃん / Pictor-chan 3D model v1.0

Built 2026-11-14 with Blender 5.3 from the Tripo rigged + animated GLB
(`tripo/anim1/tripo-out/pk-anim1-d2cc7ecd/model.glb`). Build scripts: `../v1/` (`make_dist.sh` rebuilds everything).

## Files

| File | Size | What it is |
|---|---|---|
| `PictorChan_v1.0.blend` | 22.7 MB | Master file. Textures packed. Actions on muted NLA tracks, rest pose = T-pose |
| `PictorChan_v1.0.glb` | 4.85 MB | glTF 2.0 binary. Body texture 4096 JPEG (q95), face atlas 1024 PNG, 9 morph targets, 5 animations |
| `PictorChan_v1.0.fbx` | 9.2 MB | FBX binary. Armature + 2 meshes + shape keys + 5 takes. Textures referenced as `textures/*.png` |
| `PictorChan_v1.0.vrm` | 6.9 MB | VRM 1.0 (no animations — VRM does not carry them). Body texture 4096 JPEG |
| `textures/PictorChan_Body.png` | 17.3 MB | 4096x4096 base colour, lossless |
| `textures/PictorChan_Face.png` | 0.35 MB | 1024x1024 RGBA atlas for the expression overlays |
| `web/pictor-chan-3d-v3.glb` | 1.19 MB | Game version: meshopt + WebP (body 2048), actions `idle` `run` `jump` `fall` |
| `web/preview.webp` | 61 KB | 477x900, transparent background, 3/4 view |
| `previews/turnaround.png` `expressions.png` `animations.png` | | Preview sheets |

## Geometry

| Object | Triangles | Vertices (Blender) | Material |
|---|---|---|---|
| `Body` | 24,322 | 12,791 (27,502 in glTF after UV/normal splits) | `PictorChan_Body` (opaque, double sided, roughness 0.9) |
| `Face` | 10,724 | 5,952 | `PictorChan_Face` (alpha blend, single sided, roughness 0.9) |
| Total | 35,046 | | |

Armature object: `PictorChan`, 78 bones.

## Orientation and scale

- Blender / FBX source: Z up, character faces **-Y**, 1 unit = 1 m.
- Height **1.2 m** (top of the ahoge, rest pose), feet at z = 0, hips over the origin horizontally. Transforms applied (scale 1, rotation 0).
- `PictorChan_v1.0.glb` and `.vrm`: Y up, character faces **+Z** (standard glTF / VRM 1.0 front).
- `web/pictor-chan-3d-v3.glb`: Y up, character faces **+X** (the game's convention). This is done with a +90° Y rotation on the root node `PictorChan`; meshes and bones underneath are identical to the full GLB.

## Bones

BoneRoot, Hip, Pelvis, L_Thigh, L_Calf, L_Foot, L_ToeBase, L_CalfTwist01, L_CalfTwist02, L_KneeShareBone, L_ThighTwist01, L_ThighTwist02, R_Thigh, R_Calf, R_KneeShareBone, R_Foot, R_ToeBase, R_CalfTwist01, R_CalfTwist02, R_ThighTwist01, R_ThighTwist02, Waist, Spine01, Spine02, NeckTwist01, NeckTwist02, Head, FacialBone, R_Eye, L_Eye, L_Clavicle, L_Upperarm, L_Forearm, L_ForearmTwist01, L_ForearmTwist02, L_ElbowShareBone, L_Hand, L_Pinky1-3, L_Ring1-3, L_Mid1-3, L_Index1-3, L_Thumb1-3, L_UpperarmTwist01, L_UpperarmTwist02, R_Clavicle, R_Upperarm, R_Forearm, R_ElbowShareBone, R_ForearmTwist01, R_ForearmTwist02, R_Hand, R_Ring1-3, R_Mid1-3, R_Thumb1-3, R_Index1-3, R_Pinky1-3, R_UpperarmTwist01, R_UpperarmTwist02

Hierarchy: BoneRoot → Hip → (Pelvis → legs) and (Waist → Spine01 → Spine02 → NeckTwist01 → NeckTwist02 → Head → FacialBone → eyes; Spine02 → clavicles → arms).

## Shape keys / morph targets (on `Face`, in this order)

| # | Name | Effect |
|---|---|---|
| 0 | `Blink` | both eyes closed |
| 1 | `Blink_L` | character's left eye closed |
| 2 | `Blink_R` | character's right eye closed |
| 3 | `Joy` | happy closed eyes "^ ^" |
| 4 | `Fun` | "> <" eyes |
| 5 | `Sorrow` | sad closed eyes + small closed mouth |
| 6 | `Surprised` | small "o" mouth |
| 7 | `MouthClosed` | gentle closed smile |
| 8 | `MouthOpen` | big open happy mouth |

How they work: the eyes and mouth of `Body` are real geometry (deep sockets with 3D lashes), so each expression is a small skin-coloured "lid" mesh with the feature drawn on it. In the basis shape every lid is shrunk and parked inside the head; the shape key moves it into place just above the face surface.

**Use the values 0 or 1 only.** Between 0 and 1 the lid is travelling from inside the head and may flash through the eye socket. Do not set two keys that cover the same eye or the mouth to 1 at the same time (they are layered so it will not z-fight, but only the top one shows).

VRM expressions: blink → Blink, blinkLeft → Blink_L, blinkRight → Blink_R, happy → Joy, sad → Sorrow, relaxed → MouthClosed, surprised → Surprised, aa → MouthOpen, custom `fun` → Fun. All are marked `isBinary`. happy / sad / fun block blink; sad / surprised / relaxed block mouth shapes.

## Actions (30 fps)

| Action | Frames | Duration | Notes |
|---|---|---|---|
| `Idle` | 0-460 | 15.33 s | loop |
| `Run` | 0-37 | 1.23 s | loop |
| `Jump` | 0-66 | 2.20 s | |
| `Fall` | 0-90 | 3.00 s | falls over and stays lying down |
| `Hurt` | 0-415 | 13.83 s | crouching on the ground |

All clips are in place: the hips stay over the origin horizontally (the clip average; for `Fall` the first frame). The correction is a constant offset on `BoneRoot` per clip. The original `run` clip was 0.32 units ahead and every clip was 0.05-0.16 units off to the side; that is gone, so any offset compensation in a loader must be removed.

In the web GLB the four actions are named `idle`, `run`, `jump`, `fall` (lower case) and `Hurt` is left out.
In the FBX the takes are named `PictorChan|Idle` etc.; the exporter also writes `Key|Idle` etc. takes for the shape keys (all zero).

## How each file was made

1. `01_base.py`: import, delete the importer's bone-shape Icosphere, rename, weld vertices split at UV seams (27,503 → 12,791, faces / UVs / normals unchanged), retime keys from 0.8-frame steps at 24 fps to whole frames at 30 fps, rotate to -Y front, scale 1.2006x, apply transforms, scale location curves, make clips in place.
2. `01c_weights.py`: the Tripo rig gave head and hair vertices small weights on arm / hand / finger bones (up to 0.28). These are removed above the chin (blended in between z = 0.70 and 0.78 m), 3,675 vertices. A fragment of hair that floated above the head in posed frames is fixed by this.
3. `01b_texfix.py`: a dark navy smear on the skin next to the inner corner of the right eye is painted over with the surrounding skin colour in the body texture.
4. `02_face_maps.py`, `03_atlas.py`, `04_build_face.py`: front projection of the face (colour, depth, normals), smooth skin surface and skin colour filled in over the eyes and mouth, features drawn, lids built as 5 mm grids with normals continued from the surrounding skin.
5. `05_finalize.py`, `06_export.py`: `.blend`, GLB (Blender glTF exporter), FBX (Blender FBX exporter, `FBX_SCALE_ALL`, -Z forward, Y up).
6. `08_vrm.py`: VRM Add-on for Blender (extension id `vrm`, installed from extensions.blender.org), VRM 1.0.
7. `web.sh`: `gltf-transform optimize --compress meshopt --texture-compress webp --texture-size 2048 --simplify false --join false --palette false --flatten false --instance false`.
8. `09_previews.py`, `10_assemble.py`: preview renders (EEVEE, sun shadows off).

## Verification done

- GLB, FBX, VRM and the web GLB were each re-imported into a clean Blender scene; object / shape-key / action lists were checked and posed frames with expressions were rendered and looked at.
- Not tested: three.js, Unity, Unreal, VRM viewers (VRoid Hub, UniVRM, three-vrm).

## Loading the web GLB in three.js

- Needs `MeshoptDecoder` on the `GLTFLoader` (`EXT_meshopt_compression`, `KHR_mesh_quantization`, `EXT_texture_webp`).
- Meshes: `Body` (SkinnedMesh) and `Face` (SkinnedMesh with `morphTargetDictionary`: Blink, Blink_L, Blink_R, Joy, Fun, Sorrow, Surprised, MouthClosed, MouthOpen).
- `Face` uses `alphaMode: BLEND`; keep it transparent with depth test on.
- If the game casts shadow maps onto the character, the lids receive them like any transparent surface; coarse shadow maps can look blocky on them.

## VRM licence fields (please review before publishing)

Set to a permissive combination as requested: avatarPermission `everyone`, commercialUsage `corporation`, creditNotation `required`, allowRedistribution `true`, modification `allowModificationRedistribution`, violent / sexual / political-religious / antisocial usage `false`, licenseUrl `https://vrm.dev/licenses/1.0/`. Name "ぴくたーちゃん / Pictor-chan", version "1.0", author "Aipictors".

## Known limitations

- Expressions are on/off overlays, not blendable deformations (see above).
- With the eyes closed, the lid bulges up to about 9 mm over the 3D lashes of the original mesh. It is shaded like the surrounding skin, so it reads as an eyelid, but it is visible in a close profile view.
- The painted eyebrows stay as they are in every expression, and part of the double-eyelid crease above each eye stays visible when the eyes are closed.
- Where the skin smear was painted out a faint grey tint remains at close range.
- `Body` is still the Tripo mesh: 1,314 open boundary edges and 45 non-manifold edges (eye sockets, fused hair). Not retopologised.
- Hair is rigid on the head bone except for the strands that Tripo weighted to the arms below the chin; in `Idle` a thin strand of the right side lock is pulled down by the hand. Removing those weights as well made hair tear away from the sleeves in `Fall`, so they were left.
- The eye bones (`L_Eye`, `R_Eye`) have no vertices weighted to them, so VRM look-at does nothing visible.
- The face profile has a pronounced upper lip / chin from the original mesh; closed-mouth expressions show it more than the open mouth does.
- The GLB and VRM body textures are JPEG; use `textures/PictorChan_Body.png` when a lossless source is needed.
