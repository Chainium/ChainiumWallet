import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WalletInfo } from '../models/wallet-info.model';


@Injectable({
  providedIn: 'root'
})
export class PrivatekeyService {

  constructor() { }

  walletInfo: WalletInfo;
  seed: string;
  private subject = new Subject<any>();

  existsKey(): boolean {
    if (this.walletInfo && this.walletInfo.privateKey) {
      return true;
    }

    return false;
  }

  existsSeed(): boolean {
    if (this.seed) {
      return true;
    }
    return false;
  }

  sendMessage(message: boolean) {
    this.subject.next(message);
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

}
