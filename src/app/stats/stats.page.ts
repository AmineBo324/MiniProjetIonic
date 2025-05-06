import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class StatsPage implements AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Form fields
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  groupBy: string = 'day';
  doctorEmail: string = '';
  doctors: { email: string; nom: string, prenom: string }[] = [];

  // Chart data
  chartData: any = null;
  totalAppointments: number = 0;
  loading: boolean = false;
  error: string = '';
  chart: Chart | null = null;
  isAdmin: boolean = false; // Adjust based on your auth logic

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private ngZone: NgZone
  ) {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    // Initial fetch after view is initialized
    this.fetchStats();
    this.fetchDoctors();

  }

  async fetchDoctors() {
    try {
      // Fetch doctors from backend (adjust URL as needed)
      const response = await this.http
        .get<{ email: string; nom: string, prenom: string }[]>('http://localhost:5000/medecin/all')
        .toPromise();
      this.doctors = response || [];
      console.log(this.doctors)
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      this.error = 'Erreur lors de la récupération de la liste des médecins';
    }
  }

  async fetchStats() {
    this.loading = true;
    this.error = '';
    
    // Reset chart data
    this.chartData = null;
    this.destroyChart();

    const params: any = {
      start_date: this.startDate,
      end_date: this.endDate,
      group_by: this.groupBy,
    };

    if (this.doctorEmail) {
      params.doctor_email = this.doctorEmail;
    }

    try {
      const response = await this.http
        .get<any>('http://localhost:5000/appointment/appointment_stats', { params })
        .toPromise();
      
      this.chartData = response.stats;
      this.totalAppointments = response.total;

      // Render chart after slight delay to ensure DOM stability
      setTimeout(() => {
        if (this.chartData?.length > 0) {
          this.renderChart();
        }
      }, 100);
    } catch (err: any) {
      this.error = err.message || 'Erreur lors de la récupération des statistiques';
      console.error('Error fetching stats:', err);
    } finally {
      this.loading = false;
    }
  }

  private destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  private renderChart() {
    this.ngZone.runOutsideAngular(() => {
      if (!this.chartCanvas?.nativeElement) {
        console.warn('Chart canvas not available');
        return;
      }

      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }

      const labels = this.chartData.map((item: any) => item.period);
      const data = this.chartData.map((item: any) => item.count);

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Nombre de rendez-vous',
            data,
            backgroundColor: 'rgba(6, 102, 140, 0.6)',
            borderColor: 'rgba(6, 102, 140, 1)',
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.9
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Nombre de rendez-vous'
              },
              ticks: {
                stepSize: 1
              }
            },
            x: {
              title: {
                display: true,
                text: this.groupByLabel
              }
            }
          }
        }
      });
    });
  }

  get groupByLabel(): string {
    switch (this.groupBy) {
      case 'day': return 'Jour';
      case 'week': return 'Semaine';
      case 'month': return 'Mois';
      default: return 'Période';
    }
  }

  resetForm() {
    this.startDate = new Date().toISOString().split('T')[0];
    this.endDate = new Date().toISOString().split('T')[0];
    this.groupBy = 'day';
    this.doctorEmail = '';
    this.fetchStats();
  }

  goToPage(page: string) {
    this.navCtrl.navigateForward(`/${page}`);
  }
}