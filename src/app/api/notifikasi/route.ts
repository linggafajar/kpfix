import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;

// Supaya Next.js tahu ini route dynamic, bukan static
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ambil cookie token
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Token missing' },
        { status: 401 }
      );
    }

    // Verifikasi token
    let payload: { id: number };
    try {
      payload = jwt.verify(token, SECRET) as { id: number };
    } catch (verifyError: any) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.id;

    // Ambil data peminjaman
    const peminjaman = await prisma.peminjamanBarang.findMany({
      where: { userId },
      include: { barang: true },
    });

    // Ambil data permintaan
    const permintaan = await prisma.permintaanBarang.findMany({
      where: { userId },
      include: { barang: true },
    });

    // Gabungkan dan map data
    const hasil = [
      ...peminjaman.map((p) => ({
        id: p.id,
        type: 'peminjaman' as const,
        nama: p.nama,
        keperluan: p.keperluan,
        barang: p.barang?.nama || '-',
        tanggal: p.tanggalPengajuan.toISOString(),
        status: p.status as 'pending' | 'approved' | 'rejected',
        createdAt: p.createdAt.toISOString(),
      })),
      ...permintaan.map((p) => ({
        id: p.id,
        type: 'permintaan' as const,
        nama: p.nama,
        keperluan: p.keperluan,
        barang: p.barang?.nama || '-',
        tanggal: p.tanggal.toISOString(),
        status: p.status as 'pending' | 'approved' | 'rejected',
        createdAt: p.createdAt.toISOString(),
      })),
    ];

    // Urutkan berdasarkan createdAt terbaru
    hasil.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(hasil);
  } catch (err: any) {
    console.error('Error API /api/notifikasi:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', detail: err.message },
      { status: 500 }
    );
  }
}
