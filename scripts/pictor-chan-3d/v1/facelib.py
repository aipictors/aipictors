import numpy as np

def shift_stack(a):
    p = np.pad(a, [(1, 1), (1, 1)] + [(0, 0)] * (a.ndim - 2), mode="edge")
    return p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]

def dilate(m, n=1):
    for _ in range(n):
        u, d, l, r = shift_stack(m)
        m = m | u | d | l | r
    return m

def erode(m, n=1):
    return ~dilate(~m, n)

def blur(a, sigma):
    if sigma <= 0: return a
    r = int(sigma * 3 + 1)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    out = a.astype(np.float64)
    for ax in (0, 1):
        pad = [(0, 0)] * out.ndim; pad[ax] = (r, r)
        p = np.pad(out, pad, mode="edge")
        acc = np.zeros_like(out)
        for i, w in enumerate(k):
            sl = [slice(None)] * out.ndim; sl[ax] = slice(i, i + out.shape[ax])
            acc += w * p[tuple(sl)]
        out = acc
    return out

def inpaint(img, known, iters=300):
    """known 以外を周りからなめらかに埋める (調和補間、粗→細)"""
    img = img.astype(np.float64); sq = img.ndim == 2
    if sq: img = img[..., None]
    out = _inpaint(np.where(known[..., None], img, 0.0), known, iters)
    return out[..., 0] if sq else out

def _inpaint(img, known, iters):
    h, w = known.shape
    if known.all(): return img
    if min(h, w) > 8 and known.any():
        h2, w2 = (h + 1) // 2, (w + 1) // 2
        pi = np.zeros((h2 * 2, w2 * 2, img.shape[2])); pk = np.zeros((h2 * 2, w2 * 2))
        pi[:h, :w] = img * known[..., None]; pk[:h, :w] = known
        ci = pi.reshape(h2, 2, w2, 2, -1).sum((1, 3)); ck = pk.reshape(h2, 2, w2, 2).sum((1, 3))
        cknown = ck > 0
        ci = np.where(cknown[..., None], ci / np.maximum(ck, 1)[..., None], 0)
        coarse = _inpaint(ci, cknown, iters)
        up = _up2(coarse)[:h, :w]
        cur = np.where(known[..., None], img, up)
    else:
        mean = img[known].mean(0) if known.any() else np.zeros(img.shape[2])
        cur = np.where(known[..., None], img, mean)
    k3 = known[..., None]
    for _ in range(iters):
        u, d, l, r = shift_stack(cur)
        cur = np.where(k3, img, (u + d + l + r) / 4)
    return cur

def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

def dist_to_mask(m, maxd=40):
    """マスクの外側のおおよその距離 (px)。内側は 0"""
    d = np.where(m, 0.0, 1e9)
    for _ in range(maxd):
        p = np.pad(d, 1, mode="edge")
        n4 = np.minimum.reduce([p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]]) + 1
        n8 = np.minimum.reduce([p[:-2, :-2], p[2:, 2:], p[2:, :-2], p[:-2, 2:]]) + 1.4142
        d = np.minimum(d, np.minimum(n4, n8))
    return np.minimum(d, maxd)

def classify(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    skin = (r > 0.78) & (g > 0.58) & (g < 0.92) & (b > 0.45) & (b < 0.86) & (r > g + 0.03) & (g > b + 0.02) & (r - b < 0.42)
    mx = rgb.max(-1); mn = rgb.min(-1); sat = (mx - mn) / np.maximum(mx, 1e-6)
    navy = (b > r + 0.08) & (b > g) & (sat > 0.35)
    teal = (b > r + 0.15) & (g > r + 0.1) & (sat > 0.35)
    orange = (r > 0.7) & (r - b > 0.45) & (g > 0.25) & (g < 0.62)
    return skin, (navy | teal | orange)

def _up2(a):
    """2倍に双一次で拡大"""
    h, w = a.shape[:2]
    def idx(n):
        f = (np.arange(n * 2) + 0.5) / 2 - 0.5
        i0 = np.clip(np.floor(f).astype(int), 0, n - 1); i1 = np.clip(i0 + 1, 0, n - 1)
        return i0, i1, np.clip(f - np.floor(f), 0, 1)
    y0, y1, ty = idx(h); x0, x1, tx = idx(w)
    ty = ty[:, None, None]; tx = tx[None, :, None]
    return (a[y0][:, x0] * (1 - tx) + a[y0][:, x1] * tx) * (1 - ty) + (a[y1][:, x0] * (1 - tx) + a[y1][:, x1] * tx) * ty
