import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonService {

  constructor() {}

  escapeHtml(str: string) {
    return str.replace(/[&<>"']/g, (match) => {
        switch(match) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "'":
                return "&#39;";
            default:
                return match;    
        }
    })
  }

}
