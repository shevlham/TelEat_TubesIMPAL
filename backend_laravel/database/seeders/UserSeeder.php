<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Merchant;
use App\Models\Pelanggan;
use App\Models\Admin;
use App\Models\Menu;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // =====================
        // ADMIN
        // =====================
        $admin = User::create([
            'username' => 'admin',
            'password' => Hash::make('admin'),
            'role'     => 'ADMIN',
        ]);

        Admin::create([
            'user_id' => $admin->id,
            'nama'    => 'Admin Utama',
        ]);

        // =====================
        // MERCHANT + MENU DATA
        // =====================
        $merchantData = [
            [
                'username'      => 'KATSUNA',
                'nama_merchant' => 'KATSUNA',
                'menus' => [
                    ['nama_menu' => 'Nasi Katsu Teriyaki', 'harga' => 15000, 'stok' => 15, 'kategori' => 'Makanan',  'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778867805/menu/sgfl73trlllhkrlz7dmt.jpg'],
                    ['nama_menu' => 'Nasi Katsu Kari',     'harga' => 17000, 'stok' => 28, 'kategori' => 'Makanan',  'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778917418/menu/zsovhouhlrldd5ozoo9g.jpg'],
                    ['nama_menu' => 'Katsu Ramen',         'harga' => 20000, 'stok' => 4,  'kategori' => 'Makanan',  'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778917457/menu/guro0xogvnw1n37izwr2.jpg'],
                    ['nama_menu' => 'Es Teh',              'harga' => 6000,  'stok' => 49, 'kategori' => 'Minuman',  'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778917487/menu/pmphiadrdm3ur4sr487u.jpg'],
                ],
            ],
            [
                'username'      => 'DFC',
                'nama_merchant' => 'DFC',
                'menus' => [
                    ['nama_menu' => 'Ayam Goreng',      'harga' => 9000,  'stok' => 20, 'kategori' => 'Makanan', 'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778917619/menu/lasl3mxnomwgy4iv62on.jpg'],
                    ['nama_menu' => 'Nasi Ayam Goreng', 'harga' => 13000, 'stok' => 13, 'kategori' => 'Makanan', 'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778917642/menu/ys5gitcgztbe8pj3hrhu.jpg'],
                    ['nama_menu' => 'Sempol Ayam',      'harga' => 10000, 'stok' => 29, 'kategori' => 'Cemilan', 'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778917691/menu/wkjyiayoewbiemmfdflz.jpg'],
                ],
            ],
            [
                'username'      => 'SABANA',
                'nama_merchant' => 'SABANA',
                'menus' => [],  // belum ada menu di database
            ],
            [
                'username'      => 'BAKSO MIE AYAM MAS YONO',
                'nama_merchant' => 'BAKSO MIE AYAM MAS YONO',
                'menus' => [
                    ['nama_menu' => 'Bakso',   'harga' => 10000, 'stok' => 36, 'kategori' => 'Makanan', 'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778917800/menu/az3ptw6c461seyevn2oy.jpg'],
                    ['nama_menu' => 'Mie Ayam', 'harga' => 12000, 'stok' => 43, 'kategori' => 'Makanan', 'gambar' => 'https://res.cloudinary.com/df7jtyyxr/image/upload/v1778917830/menu/zu9jrusks6gilixcneaj.jpg'],
                ],
            ],
            [
                'username'      => 'MURAH ENAK',
                'nama_merchant' => 'MURAH ENAK',
                'menus' => [],  // belum ada menu di database
            ],
        ];

        foreach ($merchantData as $data) {
            $user = User::create([
                'username' => $data['username'],
                'password' => Hash::make('merchant123'),
                'role'     => 'MERCHANT',
            ]);

            $merchant = Merchant::create([
                'user_id'       => $user->id,
                'nama_merchant' => $data['nama_merchant'],
            ]);

            foreach ($data['menus'] as $menu) {
                Menu::create([
                    'merchant_id' => $merchant->id,
                    'nama_menu'   => $menu['nama_menu'],
                    'harga'       => $menu['harga'],
                    'stok'        => $menu['stok'],
                    'kategori'    => $menu['kategori'],
                    'gambar'      => $menu['gambar'],
                ]);
            }
        }

        // =====================
        // PELANGGAN (20 ORANG)
        // =====================
        for ($i = 1; $i <= 20; $i++) {
            $user = User::create([
                'username' => 'pelanggan' . $i,
                'password' => Hash::make('pelanggan123'),
                'role'     => 'PELANGGAN',
            ]);

            Pelanggan::create([
                'user_id' => $user->id,
                'nama'    => 'Pelanggan ' . $i,
            ]);
        }
    }
}