import assert from "node:assert/strict";
import test from "node:test";
import { avatarExtension, hasAvatarSignature } from "./avatar.service";

test("avatar filenames use a server-controlled raster extension", () => {
  assert.equal(avatarExtension("image/jpeg"), ".jpg");
  assert.equal(avatarExtension("image/png"), ".png");
  for (const mime of ["image/svg+xml", "image/html", "text/html", "__proto__", "constructor"]) {
    assert.throws(() => avatarExtension(mime));
  }
});

test("spoofed HTML and SVG are rejected while supported image signatures remain valid", () => {
  const signatures: Record<string, Buffer> = {
    "image/png": Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    "image/jpeg": Buffer.from([255, 216, 255]),
    "image/gif": Buffer.from("GIF89a"),
    "image/webp": Buffer.from("RIFF1234WEBP"),
  };
  for (const [mime, bytes] of Object.entries(signatures)) {
    assert.equal(hasAvatarSignature(mime, bytes), true);
    assert.equal(hasAvatarSignature(mime, Buffer.from("<script>alert(1)</script>")), false);
    assert.equal(hasAvatarSignature(mime, Buffer.from("<svg onload='alert(1)'/>")), false);
    assert.equal(hasAvatarSignature(mime, Buffer.alloc(0)), false);
  }
});
