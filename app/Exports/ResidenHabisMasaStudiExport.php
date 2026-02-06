<?php

namespace App\Exports;

use App\Models\User;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

class ResidenHabisMasaStudiExport implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths, WithEvents
{
    protected $yearRanges = [];
    protected $periods = [];

    public function collection()
    {
        $users = User::role('residen')
            ->orderBy('username', 'desc')
            ->whereDoesntHave('ujian', function ($query) {
                $query->where('semester', 'akhir');
            })
            ->with('biodata.prodi')
            ->get();

        $prodiData = [];
        $allPeriods = [];
        $yearlyTotals = [];

        // Definisikan semua periode yang mungkin dari 2017 sampai sekarang
        $currentYear = Carbon::now()->year;
        for ($year = 2017; $year <= $currentYear; $year++) {
            $allPeriods[$year . '/1'] = true;
            $allPeriods[$year . '/2'] = true;
        }

        foreach ($users as $user) {
            if (strlen($user->username) == 10) {
                $awalAkhir = substr($user->username, 6, 1);
                $tahun = substr($user->username, 4, 2);
                $tahunFull = '20' . $tahun;
                
                if ($awalAkhir == 1) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', $tahun . "-7-15");
                    $periode = $tahunFull . '/1';
                } elseif ($awalAkhir == 2) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', $tahun . "-7-15")->addMonth(6);
                    $periode = $tahunFull . '/2';
                }

                $masaStudi = $user->biodata->prodi->masa_studi;
                $parts = explode('.', (string)$masaStudi);
                $addMonth = (count($parts) > 1) ? 6 : 0;

                $tahunLewatMasaStudiResiden = $tahunResidenMasuk->addYears($masaStudi)->addMonth($addMonth);

                if ($tahunLewatMasaStudiResiden < Carbon::now()) {
                    $prodiName = $user->biodata->prodi->name;
                    
                    if (!isset($prodiData[$prodiName])) {
                        $prodiData[$prodiName] = [];
                    }
                    
                    if (!isset($prodiData[$prodiName][$periode])) {
                        $prodiData[$prodiName][$periode] = 0;
                    }
                    
                    $prodiData[$prodiName][$periode]++;
                    
                    $tahunOnly = substr($periode, 0, 4);
                    if (!isset($yearlyTotals[$tahunOnly])) {
                        $yearlyTotals[$tahunOnly] = 0;
                    }
                    $yearlyTotals[$tahunOnly]++;
                }
            }

            if (strlen($user->username) == 11) {
                $awalAkhir = substr($user->username, 7, 1);
                $tahun = substr($user->username, 5, 2);
                $tahunFull = '20' . $tahun;
                
                if ($awalAkhir == 1) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', $tahun . "-7-15");
                    $periode = $tahunFull . '/1';
                } elseif ($awalAkhir == 2) {
                    $tahunResidenMasuk = Carbon::createFromFormat('y-m-d', $tahun . "-7-15")->addMonth(6);
                    $periode = $tahunFull . '/2';
                }

                $masaStudi = $user->biodata->prodi->masa_studi;
                $parts = explode('.', (string)$masaStudi);
                $addMonth = (count($parts) > 1) ? 6 : 0;

                $tahunLewatMasaStudiResiden = $tahunResidenMasuk->addYears($masaStudi)->addMonth($addMonth);

                if ($tahunLewatMasaStudiResiden < Carbon::now()) {
                    $prodiName = $user->biodata->prodi->name;
                    
                    if (!isset($prodiData[$prodiName])) {
                        $prodiData[$prodiName] = [];
                    }
                    
                    if (!isset($prodiData[$prodiName][$periode])) {
                        $prodiData[$prodiName][$periode] = 0;
                    }
                    
                    $prodiData[$prodiName][$periode]++;
                    
                    $tahunOnly = substr($periode, 0, 4);
                    if (!isset($yearlyTotals[$tahunOnly])) {
                        $yearlyTotals[$tahunOnly] = 0;
                    }
                    $yearlyTotals[$tahunOnly]++;
                }
            }
        }

        // Pastikan semua tahun yang didefinisikan ada di yearlyTotals
        for ($year = 2017; $year <= $currentYear; $year++) {
            if (!isset($yearlyTotals[$year])) {
                $yearlyTotals[$year] = 0;
            }
        }

        // Sort periods chronologically
        ksort($allPeriods);
        $this->periods = array_keys($allPeriods);

        // Group periods by year untuk merge cell
        $this->yearRanges = $this->createYearRanges($this->periods);

        // Sort yearly totals chronologically
        ksort($yearlyTotals);

        // Prepare data for Excel
        $excelData = collect();
        $no = 1;

        // Add first header row dengan tahun yang digabungkan
        $firstHeaderRow = ['NO', 'PRODI'];
        foreach ($this->yearRanges as $yearRange) {
            $firstHeaderRow[] = $yearRange['year'];
            // Tambahkan cell kosong untuk periode lainnya dalam tahun yang sama
            for ($i = 1; $i < $yearRange['period_count']; $i++) {
                $firstHeaderRow[] = '';
            }
        }
        $firstHeaderRow[] = 'TOTAL';
        $excelData->push($firstHeaderRow);

        // Add second header row dengan periode detail
        $secondHeaderRow = ['', ''];
        foreach ($this->yearRanges as $yearRange) {
            foreach ($yearRange['periods'] as $period) {
                $secondHeaderRow[] = $period;
            }
        }
        $secondHeaderRow[] = '';
        $excelData->push($secondHeaderRow);

        // Add yearly totals row dengan merge cell
        $yearlyTotalRow = ['', 'TOTAL PER TAHUN'];
        foreach ($this->yearRanges as $yearRange) {
            $yearlyTotalRow[] = $yearlyTotals[$yearRange['year']] ?? 0;
            // Tambahkan cell kosong untuk periode lainnya dalam tahun yang sama
            for ($i = 1; $i < $yearRange['period_count']; $i++) {
                $yearlyTotalRow[] = '';
            }
        }
        $yearlyTotalRow[] = array_sum($yearlyTotals);
        $excelData->prepend($yearlyTotalRow);

        // Add data rows for each prodi
        foreach ($prodiData as $prodiName => $periodCounts) {
            $rowData = [$no++, $prodiName];
            $total = 0;
            
            foreach ($this->periods as $period) {
                $count = $periodCounts[$period] ?? 0;
                $rowData[] = $count;
                $total += $count;
            }
            
            $rowData[] = $total;
            $excelData->push($rowData);
        }

        // Add final total row
        $finalTotalRow = ['', 'TOTAL SEMUA PRODI'];
        $grandTotal = 0;
        
        foreach ($this->periods as $period) {
            $periodTotal = 0;
            foreach ($prodiData as $periodCounts) {
                $periodTotal += $periodCounts[$period] ?? 0;
            }
            $finalTotalRow[] = $periodTotal;
            $grandTotal += $periodTotal;
        }
        $finalTotalRow[] = $grandTotal;
        $excelData->push($finalTotalRow);

        return $excelData;
    }

    protected function createYearRanges($periods)
    {
        $yearRanges = [];
        $currentYear = null;
        $currentRange = null;

        foreach ($periods as $period) {
            $year = substr($period, 0, 4);

            if ($year !== $currentYear) {
                if ($currentRange !== null) {
                    $yearRanges[] = $currentRange;
                }
                $currentYear = $year;
                $currentRange = [
                    'year' => $year,
                    'periods' => [],
                    'period_count' => 0
                ];
            }

            $currentRange['periods'][] = $period;
            $currentRange['period_count']++;
        }

        if ($currentRange !== null) {
            $yearRanges[] = $currentRange;
        }

        return $yearRanges;
    }

    public function headings(): array
    {
        return [];
    }

    public function title(): string
    {
        return 'Residen Habis Masa Studi';
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = count($this->collection()) + 1;
        $lastColumn = chr(65 + count($this->collection()->first()) - 1);

        return [
            // Style yearly totals row (row 1)
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'FF6600']],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center']
            ],

            // Style first header row (row 2 - tahun)
            2 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '4472C4']],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center']
            ],

            // Style second header row (row 3 - periode)
            3 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '4472C4']],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center']
            ],

            // Style final total row (last row)
            $lastRow => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '70AD47']],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center']
            ],

            // Add borders to all cells
            'A1:' . $lastColumn . $lastRow => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => 'thin',
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ],

            // Center align all cells
            'A1:' . $lastColumn . $lastRow => [
                'alignment' => [
                    'horizontal' => 'center',
                    'vertical' => 'center',
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        $widths = [
            'A' => 8,  // NO
            'B' => 40, // PRODI
        ];

        $column = 'C';
        foreach ($this->periods as $period) {
            $widths[$column] = 12;
            $column++;
        }
        $widths[$column] = 12; // TOTAL column

        return $widths;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $this->applyMergedCells($event);
            },
        ];
    }

    protected function applyMergedCells(AfterSheet $event)
    {
        $sheet = $event->sheet->getDelegate();
        $column = 'C'; // Start dari column C

        // Merge cells untuk TOTAL PER TAHUN (row 1) dan Tahun header (row 2)
        foreach ($this->yearRanges as $yearRange) {
            if ($yearRange['period_count'] > 1) {
                $startColumn = $column;
                $endColumn = chr(ord($startColumn) + $yearRange['period_count'] - 1);
                
                // Merge cells untuk TOTAL PER TAHUN (row 1)
                $sheet->mergeCells($startColumn . '1:' . $endColumn . '1');
                
                // Merge cells untuk Tahun header (row 2)
                $sheet->mergeCells($startColumn . '2:' . $endColumn . '2');
                
                $column = chr(ord($endColumn) + 1);
            } else {
                // Untuk tahun dengan hanya 1 periode, tidak perlu merge
                $column = chr(ord($column) + 1);
            }
        }

        // Merge cell TOTAL di row 1, 2, dan 3
        $totalCol = $column;
        $sheet->mergeCells($totalCol . '1:' . $totalCol . '3');
    }
}