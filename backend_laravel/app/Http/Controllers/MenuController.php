<?php
// app/Http/Controllers/MenuController.php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Merchant;
use Illuminate\Http\Request;

class MenuController extends Controller
{

    public function index()
    {
        $menus = Menu::with('merchant:id,nama_merchant')->get();
        return response()->json(['success' => true, 'data' => $menus]);
    }

    // GET /api/menus/{id}
    public function show($id)
    {
        $menu = Menu::with('merchant')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $menu]);
    }

    public function store(Request $request)
{
    $request->validate([
        'nama_menu' => 'required|string',
        'harga'     => 'required|numeric|min:0',
        'stok'      => 'required|integer|min:0',
        'gambar'    => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    $merchant = $request->user()->merchant;
    if (!$merchant) {
        return response()->json(['message' => 'Hanya merchant yang bisa menambah menu'], 403);
    }

    if ($request->hasFile('gambar')) {
        $result = cloudinary()->uploadApi()->upload($request->file('gambar')->getRealPath(), [
            'folder' => 'menu',
            'verify' => false
        ]);
        $path = $result['secure_url'];
    } else {
        $path = null;
    }

    $menu = Menu::create([
        'merchant_id' => $merchant->id,
        'nama_menu'   => $request->nama_menu,
        'harga'       => $request->harga,
        'stok'        => $request->stok,
        'gambar'      => $path,
    ]);

    return response()->json(['success' => true, 'data' => $menu], 201);
}


    public function update(Request $request, $id)
{
    $menu = Menu::findOrFail($id);
    $merchant = $request->user()->merchant;

    if (!$merchant || $menu->merchant_id !== $merchant->id) {
        return response()->json(['message' => 'Tidak diizinkan'], 403);
    }

    if ($request->hasFile('gambar')) {
        
        $result = cloudinary()->uploadApi()->upload($request->file('gambar')->getRealPath(), [
            'folder' => 'menu',
            'verify' => false
        ]);
        $menu->gambar = $result['secure_url'];
    }

    $menu->update($request->only(['nama_menu', 'harga', 'stok']));

    return response()->json(['success' => true, 'data' => $menu]);
}

    // DELETE /api/menus/{id}
    public function destroy(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);
        $merchant = $request->user()->merchant;

        if (!$merchant || $menu->merchant_id !== $merchant->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $menu->delete();
        return response()->json(['message' => 'Menu dihapus']);
    }
}
