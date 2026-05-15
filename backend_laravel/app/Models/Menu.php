<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = [
        'nama_menu',
        'harga',
        'stok',
        'merchant_id',
        'gambar'
    ];

    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }
}