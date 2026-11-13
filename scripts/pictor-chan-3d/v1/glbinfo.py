"""GLB の中身を短く出す: python3 glbinfo.py file.glb"""
import json, struct, sys
f = open(sys.argv[1], "rb"); magic, ver, total = struct.unpack("<III", f.read(12)); n, t = struct.unpack("<II", f.read(8)); j = json.loads(f.read(n))
print("size", total, "extensionsUsed", j.get("extensionsUsed"), "required", j.get("extensionsRequired"))
for nd in j["nodes"]:
    if "mesh" in nd or "children" in nd and nd["name"] in ("PictorChan",) or nd.get("rotation") and "skin" not in nd and nd["name"] in ("PictorChan", "BoneRoot"):
        print("node", nd["name"], {k: nd[k] for k in ("mesh", "skin", "rotation", "translation", "scale") if k in nd})
print("scene roots", [j["nodes"][i]["name"] for i in j["scenes"][0]["nodes"]])
for m in j["meshes"]:
    p = m["primitives"][0]
    print("mesh", m["name"], "prims", len(m["primitives"]), "targets", len(p.get("targets", [])), "targetNames", m.get("extras", {}).get("targetNames"), "weights", m.get("weights"), "attrs", list(p["attributes"]), "target attrs", list(p["targets"][0]) if p.get("targets") else None)
for m in j["materials"]: print("material", m["name"], m.get("alphaMode", "OPAQUE"), "doubleSided", m.get("doubleSided", False), {k: v for k, v in m["pbrMetallicRoughness"].items() if k != "baseColorTexture"})
for i in j.get("images", []): print("image", i.get("name"), i.get("mimeType"), j["bufferViews"][i["bufferView"]]["byteLength"] if "bufferView" in i else i.get("uri"))
for a in j.get("animations", []):
    acc = j["accessors"]; mx = max(acc[s["input"]]["max"][0] for s in a["samplers"]); paths = {}
    for c in a["channels"]: paths[c["target"]["path"]] = paths.get(c["target"]["path"], 0) + 1
    print("anim", a["name"], "dur", round(mx, 3), paths)
print("skins", [(s.get("name"), len(s["joints"])) for s in j.get("skins", [])])
