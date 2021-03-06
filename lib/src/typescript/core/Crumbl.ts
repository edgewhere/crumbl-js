import { FPECipher } from 'feistel-cipher'

import { Crumb } from '../Encrypter/Crumb'
import { Dispatcher } from '../Encrypter/Dispatcher'
import { encrypt } from '../Encrypter'
import { Hasher } from '../Hasher'
import { Obfuscator, DEFAULT_HASH_ENGINE, DEFAULT_KEY_STRING, DEFAULT_ROUNDS } from '../Obfuscator'
import { Signer } from '../models/Signer'
import { Slicer, MAX_SLICES, getDeltaMax } from '../Slicer'
import { Padder } from '../Padder'

export const VERSION = '1' // TODO Change when necessary (change of hash algorithm, modification of string structure, etc.)

export class Crumbl {
  source: string
  hashEngine: string
  owners: [Signer, ...Array<Signer>]
  trustees: [Signer, ...Array<Signer>]

  private padder: Padder
  private cipher: FPECipher

  constructor(source: string, hashEngine: string, owners: [Signer, ...Array<Signer>], trustees: [Signer, ...Array<Signer>]) {
    this.source = source
    this.hashEngine = hashEngine
    this.owners = owners
    this.trustees = trustees
    this.padder = new Padder()
    this.cipher = new FPECipher(DEFAULT_HASH_ENGINE, DEFAULT_KEY_STRING, DEFAULT_ROUNDS)
  }

  async process(): Promise<string> {
    return await this.doCrumbl()
  }

  async toHTML(element: HTMLElement): Promise<string> {
    let crumbled = ''
    crumbled = await this.doCrumbl()
    element.innerText = crumbled
    return crumbled
  }

  private async doCrumbl(): Promise<string> {
    // 1- Obfuscate
    const obfuscator = new Obfuscator(this.cipher)
    const obfuscated = obfuscator.apply(this.source)

    // 2- Pad
    const padded = this.padder.apply(obfuscated.toString(), obfuscated.length, true)

    // 3- Slice
    const numberOfSlices = 1 + Math.min(this.trustees.length, MAX_SLICES)
    const deltaMax = getDeltaMax(obfuscated.length, numberOfSlices)
    const slicer = Slicer(numberOfSlices, deltaMax)
    const slices = slicer.slice(padded)

    // 4- Encrypt
    const crumbs = new Array<Crumb>()
    for (let i = 0; i < this.owners.length; i++) {
      const crumb = await encrypt(slices[0], 0, this.owners[i])
      crumbs.push(crumb)
    }

    const dispatcher = new Dispatcher(numberOfSlices, this.trustees)
    const allocation = dispatcher.allocate()
    for (let i = 1; i < allocation.size + 1; i++) { // Initial index is 1 in allocation
      const maybeAllocated = allocation.get(i)
      if (maybeAllocated !== undefined) {
        for (let j = 0; j < maybeAllocated.length; j++) {
          const crumb = await encrypt(slices[i], i, maybeAllocated[j])
          crumbs.push(crumb)
        }
      }
    }

    // 5- Hash the source string
    const hasher = new Hasher(crumbs)
    const hashered = await hasher.apply(this.source)

    // 6- Finalize the output string
    const stringifiedCrumbs = new Array<string>()
    for (let i = 0; i < crumbs.length; i++) {
      stringifiedCrumbs.push(crumbs[i].toString())
    }
    const crumbled = hashered + stringifiedCrumbs.join('') + '.' + VERSION

    return crumbled
  }
}
