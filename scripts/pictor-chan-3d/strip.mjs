// 使わない動き（hurt）と目印の球を外す
import { NodeIO } from "@gltf-transform/core"
const [src, out] = process.argv.slice(2)
const io = new NodeIO()
const doc = await io.read(src)
for (const animation of doc.getRoot().listAnimations()) {
  if (!["idle", "run", "jump", "fall"].includes(animation.getName())) {
    for (const channel of animation.listChannels()) channel.dispose()
    for (const sampler of animation.listSamplers()) sampler.dispose()
    animation.dispose()
  }
}
for (const node of doc.getRoot().listNodes()) {
  if (node.getName().startsWith("Icosphere")) node.dispose()
}
await io.write(out, doc)
console.log(doc.getRoot().listAnimations().map((a) => a.getName()))
