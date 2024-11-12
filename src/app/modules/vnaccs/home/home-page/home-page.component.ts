import { CommonModule } from '@angular/common'
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCarouselComponent, NzCarouselModule } from 'ng-zorro-antd/carousel'
import { HomeService } from '../home.service'
import { AuthService } from '../../../../shared/services/auth.service'
import { NotificationService } from '../../../../shared/services/notification.service'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { saveAs } from 'file-saver'
import { catchError, of } from 'rxjs'

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  standalone: true,
  imports: [NzButtonModule, TranslateModule, CommonModule, NzCarouselModule, NzToolTipModule]
})
export class HomePageComponent implements AfterViewInit {
  @ViewChild('carousel') carousel!: NzCarouselComponent
  currentTime: number = 0
  videoDuration: number = 0
  @ViewChild('videoRef', { static: true }) videoRef!: ElementRef<HTMLVideoElement>
  isLogin: boolean = false
  dataTable: any = []
  effect = 'scrollx'
  listUrl: string[] = []

  constructor(
    private translate: TranslateService,
    private homeSrv: HomeService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private notification: NotificationService
  ) {
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.onloadedmetadata = () => {
        this.videoDuration = this.videoRef.nativeElement.duration
      }
    }
  }

  ngOnInit() {
    this.getGuideVideoFile()
    this.getAllNotiFile()
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLogin = this.authService.getLoginStatus()
      this.cdr.detectChanges()
    })
  }

  ngAfterViewInit() {}

  updateSlider(video: HTMLVideoElement) {
    this.currentTime = video.currentTime
  }

  onSliderChange(event: any, video: HTMLVideoElement) {
    const newTime = event.target.value
    video.currentTime = newTime
    this.currentTime = newTime
  }

  onVideoEnded(carousel: any) {
    carousel.next()
  }

  downloadNotiFile(id: string) {
    this.homeSrv.downloadNotiFile(id).subscribe((res: any) => {
      if (res && res.message === 'OK') {
        const base64Data = res.data
        const binaryString = window.atob(base64Data)

        const byteArray = new Uint8Array(binaryString.length)

        for (let i = 0; i < binaryString.length; i++) {
          byteArray[i] = binaryString.charCodeAt(i)
        }

        const blob = new Blob([byteArray], { type: 'application/octet-stream' })
        const url = window.URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url

        const x = this.dataTable.find((ele: any) => ele['fileId'] === id)
        a.download = x.filePath.split('/').pop()
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      }
    })
  }

  getAllNotiFile() {
    this.homeSrv.getAllNotiFile().subscribe((res: any) => {
      if (res && res.message === 'success') {
        this.dataTable = res.data
      }
    })
  }

  getGuideVideoFile() {
    this.homeSrv.getGuideVideoFile().subscribe((res: any) => {
      if (res) {
        if (res.success) {
          const prefix = 'https://api-service.techasians.com/customs-gov/admin-service/api/file/stream-video?path='
          res.data.forEach((ele: any) => {
            const url = prefix + ele
            this.listUrl.push(url)
          })
        }
      }
    })
  }

  isDownloading: boolean = false

  downloadGuideFile() {
    // Disable button or show loading indicator to prevent double clicks
    this.isDownloading = true // Track the download state (you need to define this in your component)

    this.homeSrv.downloadGuideFile().subscribe((res: any) => {
      // Re-enable the button or hide the loading indicator
      this.isDownloading = false

      if (res) {
        try {
          saveAs(res, 'FILE_HUONG_DAN.zip')
        } catch (error) {
          console.error('Error processing the file:', error)
          alert('Error processing the downloaded file. Please try again later.')
        }
      }
    })
  }

  downloadJDK() {
    this.homeSrv.getJDK().subscribe((res: any) => {
      if (res && res.code == 200 && res.data) {
        const version = res.data
        const link = document.createElement('a')
        link.href = `https://download.oracle.com/java/${version}/latest/jdk-${version}_linux-aarch64_bin.tar.gz`
        link.target = '_blank'
        link.download = 'JDK.zip'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
  }
}
