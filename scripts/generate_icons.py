import zlib
import struct
import os

def create_hollow_icon_png(size, path):
    raw_data = bytearray()
    cx, cy = size / 2.0, size / 2.0
    corner_radius = size * 0.28
    stroke_w = max(1.2, size * 0.08)

    for y in range(size):
        raw_data.append(0) # Filter 0
        for x in range(size):
            # Rounded rect distance
            dx = max(abs(x + 0.5 - cx) - (cx - corner_radius), 0)
            dy = max(abs(y + 0.5 - cy) - (cy - corner_radius), 0)
            dist = (dx*dx + dy*dy)**0.5
            
            in_squircle = dist <= corner_radius
            
            if in_squircle:
                # Background: sleek deep dark slate (#0f172a)
                r, g, b, a = 15, 23, 42, 255
                
                # Draw a hollow outline lightning / spark symbol in the center
                # Normalized coords [-1, 1]
                nx = (x + 0.5 - cx) / (size * 0.38)
                ny = (y + 0.5 - cy) / (size * 0.38)
                
                # Check line segments for hollow lightning bolt:
                # Path: (0.1, -0.9) -> (-0.5, 0.1) -> (0.0, 0.1) -> (-0.2, 0.9) -> (0.6, -0.1) -> (0.1, -0.1) -> cycle
                pts = [
                    (0.12, -0.85),
                    (-0.45, 0.08),
                    (0.02, 0.08),
                    (-0.18, 0.85),
                    (0.55, -0.05),
                    (0.08, -0.05)
                ]
                
                # Distance to polygon boundary (hollow stroke)
                min_edge_dist = 999.0
                num_pts = len(pts)
                for i in range(num_pts):
                    p1 = pts[i]
                    p2 = pts[(i + 1) % num_pts]
                    # Segment distance
                    vx, vy = p2[0] - p1[0], p2[1] - p1[1]
                    wx, wy = nx - p1[0], ny - p1[1]
                    c1 = wx * vx + wy * vy
                    c2 = vx * vx + vy * vy
                    t = max(0.0, min(1.0, c1 / c2 if c2 > 0 else 0))
                    proj_x = p1[0] + t * vx
                    proj_y = p1[1] + t * vy
                    d = ((nx - proj_x)**2 + (ny - proj_y)**2)**0.5
                    if d < min_edge_dist:
                        min_edge_dist = d
                
                stroke_threshold = stroke_w / (size * 0.38)
                if min_edge_dist <= stroke_threshold:
                    # Crisp hollow electric indigo stroke (#818cf8)
                    t_glow = min_edge_dist / stroke_threshold
                    r = int(129 * (1 - t_glow*0.3))
                    g = int(140 * (1 - t_glow*0.3))
                    b = 248
                
                raw_data.extend([r, g, b, a])
            else:
                raw_data.extend([0, 0, 0, 0])

    def chunk(tag, data):
        return struct.pack('!I', len(data)) + tag + data + struct.pack('!I', zlib.crc32(tag + data) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('!IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png += chunk(b'IHDR', ihdr)
    compressed = zlib.compress(bytes(raw_data))
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')

    with open(path, 'wb') as f:
        f.write(png)

icons_dir = "/Users/Ertan/Desktop/obs-survey-autofill/icons"
os.makedirs(icons_dir, exist_ok=True)
create_hollow_icon_png(16, f"{icons_dir}/icon16.png")
create_hollow_icon_png(48, f"{icons_dir}/icon48.png")
create_hollow_icon_png(128, f"{icons_dir}/icon128.png")
print("Hollow outline icons generated successfully!")
