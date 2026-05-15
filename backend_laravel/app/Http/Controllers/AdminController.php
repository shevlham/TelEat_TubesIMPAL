<?php
// app/Http/Controllers/AdminController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pesanan;
use App\Models\Transaksi;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // GET /api/admin/users
    public function users()
    {
        $users = User::with(['admin', 'merchant', 'pelanggan'])->get()->map(function ($u) {
            return [
                'id'       => $u->id,
                'username' => $u->username,
                'role'     => $u->role,
                'nama'     => $u->admin?->nama ?? $u->merchant?->nama_merchant ?? $u->pelanggan?->nama,
            ];
        });
        return response()->json(['success' => true, 'data' => $users]);
    }

    // DELETE /api/admin/users/{id}
    public function deleteUser($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User dihapus']);
    }

    // GET /api/admin/dashboard
    public function dashboard()
    {
        $transaksis = Transaksi::with(['pesanan.pelanggan', 'pesanan.merchant'])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_user'      => User::count(),
                'total_pesanan'   => Pesanan::count(),
                'total_transaksi' => Transaksi::where('status_bayar', 'LUNAS')->sum('total_bayar'),
                'pesanan_pending' => Pesanan::where('status', 'PENDING')->count(),
                'transaksis'      => $transaksis
            ]
        ]);
    }

    // PUT /api/admin/transaksi/{id}/lunas
    public function lunasTransaksi($id)
    {
        $transaksi = Transaksi::findOrFail($id);
        $transaksi->update(['status_bayar' => 'LUNAS']);
        
        // Also update pesanan status if necessary (optional)
        // $transaksi->pesanan->update(['status' => 'DIPROSES']); 
        // We will leave the pesanan status logic to the merchant or auto-update to DIPROSES if paid.
        // Usually, if paid, it can be processed by the merchant. Let's update pesanan status.
        if ($transaksi->pesanan && $transaksi->pesanan->status === 'PENDING') {
            $transaksi->pesanan->update(['status' => 'DIPROSES']);
        }

        return response()->json(['success' => true, 'message' => 'Pembayaran berhasil dikonfirmasi']);
    }
}
