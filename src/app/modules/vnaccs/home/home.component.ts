import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HomeService } from './home.service';
import { Subject } from 'rxjs';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    NzButtonModule,
    TranslateModule,
    CommonModule,
    NzCarouselModule
  ]
})
export class HomeComponent implements OnInit {
  isLogin: boolean = true;
  dataTable: any = [];
  effect = 'scrollx';
  videosBase64: string[] = [];

  constructor(
    private translate: TranslateService,
    private homeSrv: HomeService
  ) { }

  ngOnInit() {
    // this.getAllNotiFile();
    // this.getGuideVideoFile();
  }

  downloadNotiFile(id: string) {
    this.homeSrv.downloadNotiFile(id).subscribe((res: any) => {
      if(res && res.message === 'OK') {
        const base64Data = res.data;
        const binaryString = window.atob(base64Data);

        const byteArray = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;

        const x = this.dataTable.find((ele: any) => ele['fileId'] === id);
        a.download = x.filePath.split('/').pop()
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    })
  }

  getAllNotiFile() {
    this.homeSrv.getAllNotiFile().subscribe((res: any) => {
      if(res && res.message === 'success') {
        this.dataTable = res.data;
      }
    })
  }

  getGuideVideoFile() {
    this.homeSrv.getGuideVideoFile().subscribe((res: any) => {
      if(res && res.message === 'OK') {
        this.videosBase64.push(res.data);
        res.data.forEach((ele: any) => {
          this.videosBase64.push(ele)
        })
        this.loadVideos();
        }
      })
  }

  loadVideos(): void {
    this.videosBase64.forEach((base64Data, index) => {
      const binaryString = window.atob(base64Data.split(',')[1]);
      const byteNumbers = new Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteNumbers[i] = binaryString.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'video/mp4' });
      const videoUrl = window.URL.createObjectURL(blob);

      const videoElement = document.getElementById('video' + index) as HTMLVideoElement;
      if (videoElement) {
        videoElement.src = videoUrl;
        videoElement.load();
      }
    });
  }

  downloadGuideFile() {
    this.homeSrv.downloadGuideFile().subscribe((res: any) => {
      if(res && res.message === 'OK') {
      const base64Data = res.data;
        const binaryString = window.atob(base64Data);

        const byteArray = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;

        a.download = 'Hướng dẫn sử dụng.pdf';
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        a.remove();
      }
    })
  }
  downloadJDK() {
    const link = document.createElement('a');
    link.href = 'https://download.oracle.com/java/23/latest/jdk-23_linux-aarch64_bin.tar.gz';
    link.target = '_blank';
    link.download = 'JDK.zip';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

}
