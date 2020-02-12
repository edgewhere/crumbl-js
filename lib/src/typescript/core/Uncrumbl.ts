import { Collector } from '../Decrypter/Collector'
import { Crumb, toCrumb } from '../Encrypter/Crumb'
import { decrypt } from '../Decrypter'
import { DEFAUT_HASH_LENGTH, DEFAULT_HASH_ENGINE } from '../crypto'
import { Obfuscator, DEFAULT_KEY_STRING, DEFAULT_ROUNDS } from '../Obfuscator'
import { Signer } from '../models/Signer'
import { Uncrumb } from '../Decrypter/Uncrumb'
import { VERSION } from './Crumbl'

export class Uncrumbl {
  crumbled: string
  slices: Array<Uncrumb>
  verificationHash: string
  signer: Signer
  isOwner: boolean

  constructor(crumbled: string, slices: Array<Uncrumb>, verificationHash: string, signer: Signer, isOwner: boolean) {
    this.crumbled = crumbled
    this.slices = slices
    this.verificationHash = verificationHash
    this.signer = signer
    this.isOwner = isOwner
  }

  async process(): Promise<Buffer> {
    return this.doUncrumbl()
  }

  async toHTML(element: HTMLElement): Promise<Buffer> {
    const uncrumbled = await this.doUncrumbl()
    element.innerText = uncrumbled.toString()
    return uncrumbled
  }

  private async doUncrumbl(): Promise<Buffer> {
    // 1- Parse
    const parts = this.crumbled.split('.', 2)
    if (parts[1] != VERSION) {
      return Promise.reject(new Error('incompatible version: ' + parts[1]))
    }

    const verificationHash = parts[0].substr(0, DEFAUT_HASH_LENGTH)
    if (verificationHash != this.verificationHash) {
      return Promise.reject(new Error('incompatible input verification hash with crumbl'))
    }

    const crumbs = new Array<Crumb>()
    let crumbsStr = parts[0].substr(DEFAUT_HASH_LENGTH)
    while (crumbsStr.length > 0) {
      const nextLen = parseInt(crumbsStr.substr(2, 4), 16)
      const nextCrumb = crumbsStr.substr(0, nextLen + 6)
      const crumb = toCrumb(nextCrumb)
      crumbs.push(crumb)
      crumbsStr = crumbsStr.substr(nextLen + 6)
    }

    // 2- Decrypt crumbs
    const uncrumbs = new Map<number, Uncrumb>()
    const indexSet = new Map<number, boolean>()
    for (let i = 0; i < crumbs.length; i++) {
      const idx = crumbs[i].index
      if (!indexSet.has(idx) || indexSet.get(idx)) { // eslint-disable-line @typescript-eslint/strict-boolean-expressions
        indexSet.set(idx, true)
      }
      if (!this.isOwner && idx == 0 || this.isOwner && idx != 0) {
        continue
      }
      try {
        const uncrumb = await decrypt(crumbs[i], this.signer)
        if (!uncrumbs.has(uncrumb.index)) {
          uncrumbs.set(idx, uncrumb)
        }
      } catch (e) {
        // NO-OP
      }
    }

    // 3- Add passed uncrumbs
    for (let i = 0; i < this.slices.length; i++) {
      if (!uncrumbs.has(this.slices[i].index)) {
        uncrumbs.set(this.slices[i].index, this.slices[i])
      }
    }

    // 4- Determine output
    let hasAllCrumbs = false
    if (indexSet.size == uncrumbs.size) {
      hasAllCrumbs = true
    }
    if (this.isOwner && !hasAllCrumbs) {
      return Promise.reject(new Error('missing crumbs to fully uncrumbl as data owner: only partial uncrumbs are returned'))
    }
    if (hasAllCrumbs) {
      // Owner may recover fully-deciphered data
      const collector = new Collector(uncrumbs, indexSet.size, verificationHash, DEFAULT_HASH_ENGINE)

      // 5a- Deobfuscate
      const obfuscated = collector.toObfuscated()
      const obfuscator = new Obfuscator(DEFAULT_KEY_STRING, DEFAULT_ROUNDS)
      const deobfuscated = obfuscator.unapply(obfuscated)

      return collector.check(Buffer.from(deobfuscated))
        .then(isCheck => isCheck ? Promise.resolve(Buffer.from(deobfuscated)) : Promise.reject(new Error('source has not checked verification hash')))
    } else {
      // Trustee only could return his own uncrumbs

      // 5b- Build partial uncrumbs
      let partialUncrumbs = ''
      for (let i = 0; i < indexSet.size; i++) {
        const maybePartial = uncrumbs.get(i)
        if (maybePartial !== undefined) {
          partialUncrumbs += maybePartial.toString()
        }
      }

      // 6b- Add verification hash prefix

      return Buffer.from(verificationHash + partialUncrumbs + '.' + VERSION)
    }
  }
}
