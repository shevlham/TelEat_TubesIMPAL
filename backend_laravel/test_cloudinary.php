<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $cloudinaryUrl = env('CLOUDINARY_URL');
    if (empty($cloudinaryUrl)) {
        echo "Error: CLOUDINARY_URL is kosong di .env\n";
        exit(1);
    }

    // Create a dummy image
    if (!is_dir(__DIR__.'/storage/app/public')) {
        mkdir(__DIR__.'/storage/app/public', 0777, true);
    }
    $imagePath = __DIR__.'/storage/app/public/dummy_test.gif';
    
    // Generate a simple 1x1 transparent GIF
    $gifData = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    file_put_contents($imagePath, $gifData);

    echo "Menguji koneksi ke Cloudinary...\n";
    
    // Upload dummy image
    $result = cloudinary()->uploadApi()->upload($imagePath, [
        'folder' => 'test_cloudinary'
    ]);
    
    echo "✅ Berhasil upload ke Cloudinary!\n";
    echo "URL Gambar: " . $result['secure_url'] . "\n";
    
    // Delete the test image from Cloudinary
    echo "Menghapus gambar test dari Cloudinary...\n";
    cloudinary()->uploadApi()->destroy($result['public_id']);
    
    @unlink($imagePath); // Hapus gambar lokal
    echo "✅ Testing selesai dan berhasil!\n";
    
} catch (\Throwable $e) {
    echo "❌ Gagal: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
