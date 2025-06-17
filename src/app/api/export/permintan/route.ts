import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range'); // all | 1bulan | 3bulan | 1tahun

  let dateFilter: Date | null = null;
  const now = new Date();

  if (range === '1bulan') {
    dateFilter = new Date(now);
    dateFilter.setMonth(now.getMonth() - 1);
  } else if (range === '3bulan') {
    dateFilter = new Date(now);
    dateFilter.setMonth(now.getMonth() - 3);
  } else if (range === '1tahun') {
    dateFilter = new Date(now);
    dateFilter.setFullYear(now.getFullYear() - 1);
  }

  try {
    const where = dateFilter ? { tanggal: { gte: dateFilter } } : {};

    const data = await prisma.permintaanBarang.findMany({
      where,
      orderBy: { tanggal: 'desc' },
      include: {
        barang: true, // untuk ambil nama barang
      },
    });

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Permintaan');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 5 },
      { header: 'Nama', key: 'nama', width: 20 },
      { header: 'Jabatan', key: 'jabatan', width: 15 },
      { header: 'Kelas', key: 'kelas', width: 10 },
      { header: 'Keperluan', key: 'keperluan', width: 20 },
      { header: 'Nama Barang', key: 'namaBarang', width: 20 },
      { header: 'Jumlah', key: 'jumlah', width: 10 },
      { header: 'Tgl Permintaan', key: 'tanggal', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        id: item.id,
        nama: item.nama,
        jabatan: item.jabatan,
        kelas: item.kelas,
        keperluan: item.keperluan,
        namaBarang: item.barang?.nama || '-',
        jumlah: item.jumlah,
        tanggal: new Date(item.tanggal).toLocaleDateString(),
        status: item.status,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=permintaan_${range || 'all'}.xlsx`,
      },
    });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Gagal export', detail: err.message }, { status: 500 });
  }
}
