import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WalletInfo } from '../models/wallet-info.model';
import { WalletContext } from '../models/wallet-context.model';
import * as _ from 'lodash';
import { CryptoService } from '../services/crypto.service';
import { PrivatekeyService } from './privatekey.service';

@Injectable({
providedIn: 'root'
})
export class WalletService {

    constructor(private cryptoService: CryptoService,
        private privateKeyService: PrivatekeyService) { }

    private context: WalletContext;

    private subject = new Subject<any>();

    setWalletContext (context: WalletContext) {
        this.context = context;
        localStorage.setItem('walletKeyStore', context.walletKeystore);
    }

    getWalletContext (): WalletContext {
        return {
            walletKeystore: localStorage.getItem('walletKeyStore'),
            passwordHash: this.context ? this.context.passwordHash : null
        }
    }

    getWalletInfo (chxAddress: string): Observable<any>{
        const context = this.getWalletContext();
        if (!context.passwordHash || !context.walletKeystore) {
            return null;
        }
        const addresses = JSON.parse(localStorage.getItem('walletChxAddresses')) || [];
        const index = addresses.indexOf(chxAddress);
        if (index >= 0) {
            return this.cryptoService.generateWalletFromKeystore(
                context.walletKeystore,
                context.passwordHash,
                index);
        }
    }

    getAllChxAddresses (): string[] {
        return JSON.parse(localStorage.getItem('walletChxAddresses')) || [];
    }

    getSelectedChxAddress () {
        return localStorage.getItem('walletSelectedChxAddress');
    }

    setSelectedChxAddress (chxAddress: string) {
        localStorage.setItem('walletSelectedChxAddress', chxAddress);
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

    createNewChxAddress () {
        const index = this.getNextWalletIndex();
        this.createChxAddress(index);
    }

    generateWalletFromContext() {
        this.createChxAddress(0);
    }

    clearWalletContext() {
        localStorage.removeItem('walletKeyStore');
        localStorage.removeItem('walletChxAddresses');
        localStorage.removeItem('walletSelectedChxAddress');
        this.context = null;
    }

    unloadWallet() {
        this.clearWalletContext();
        this.privateKeyService.setWalletInfo(null);
        this.sendMessage(true);
    }

    private createChxAddress(index: number) {

        const context = this.getWalletContext();
        if (!context.passwordHash || !context.walletKeystore) { return; }

        this.cryptoService.generateWalletFromKeystore(context.walletKeystore, context.passwordHash, index)
            .subscribe((wallet: WalletInfo) => {
                const selectedChxAddress = this.getSelectedChxAddress();
                const chxAddresses = this.getAllChxAddresses();

                // sanitize non-recoverable peristed addresses
                if (index === 0 && chxAddresses.length > 0 && wallet.address !== chxAddresses[0]) {
                    // clear active address selection
                    const selectedChxAddress = this.getSelectedChxAddress();
                    if (selectedChxAddress === chxAddresses[0]) {
                        this.setSelectedChxAddress(null);
                    }

                    // remove old chx address form the storage
                    chxAddresses.shift();
                    localStorage.setItem('walletChxAddresses', JSON.stringify(chxAddresses));
                }

                this.addAddressToStorage(wallet.address);

                const isValidSelectedChxAddress = selectedChxAddress && chxAddresses.indexOf(selectedChxAddress) >= 0;
                if (index === 0 && isValidSelectedChxAddress) {
                    this.getWalletInfo(selectedChxAddress)
                        .subscribe (walletInfo => this.privateKeyService.setWalletInfo(walletInfo));
                } else {
                    this.privateKeyService.setWalletInfo(wallet);
                }

                this.privateKeyService.sendMessage(this.privateKeyService.existsKey());
        });
    }

    private addAddressToStorage(address: string) {

        const addresses = JSON.parse(localStorage.getItem('walletChxAddresses')) || [];
        const addressExists = addresses.find((a: string) => a === address);

        if (!addressExists) {
            addresses.push(address);
            localStorage.setItem('walletChxAddresses', JSON.stringify(addresses));
        }
    }

    private getNextWalletIndex(){
        const addresses = JSON.parse(localStorage.getItem('walletChxAddresses')) || [];
        return addresses.length;
    }
}
