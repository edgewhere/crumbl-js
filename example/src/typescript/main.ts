import * as crumbl from '../../../lib/src/typescript/index'

async function main() {
    crumbl.logger.log('starting to process example', crumbl.INFO)
    let source = 'cdever@edgewhere.fr'
    let errors = new Array<Error>()

    let crumbled = ''
    const workerCreator: crumbl.Worker = {
        mode: crumbl.CREATION,
        ownerKeys: 'ecies:./test/src/typescript/crypto/ecies/keys/owner1.pub',
        signerKeys: 'ecies:./test/src/typescript/crypto/ecies/keys/trustee1.pub,rsa:./test/src/typescript/crypto/rsa/keys/trustee2.pub',
        data: [source]
    }
    const cwCreator = new crumbl.CrumblWorker(workerCreator)
    try {
        crumbled = await cwCreator.process()
        console.log(crumbled)
    } catch (e) {
        errors.push(e)
        crumbl.logger.log(e, crumbl.ERROR)
    }

    let uncrumbled1 = ''
    const workerTrustee1: crumbl.Worker = {
        mode: crumbl.EXTRACTION,
        signerKeys: 'ecies:./test/src/typescript/crypto/ecies/keys/trustee1.pub',
        signerSecret: './test/src/typescript/crypto/ecies/keys/trustee1.sk',
        data: [
            crumbled ? crumbled : '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d0000a8BJTkFAnzpe4fPWZWbZwaI68NbLq++xD6tKPnFcl3yWnmUKI3Evk1Ax3WZbqsU1uurEcGH9Kfjdmgm+/qjaUSilBCUwTfXE/SgDTVY0OYnFe/g3xN7gwOTUEUF470c00LDo/ns1dXULzZw6iunztApfptXbUVR590WX8Jsg==010158NwuvJKqSgOQjPveYXoCepULX3NtYAVXMCBioeq8bFi+MZWJVTmzYYIsZSpNJ3QvXV3QcaQHVXlQrtR05QatnGkiJqy9a0KZjQRzrYhatNqv+2PqIoFMHQ+Z+uiOYca0GuDEu293xMsdRv8Bh3FfQaCR5vt1iyCsyHwS0wEkfx0ubkZii27nXJH4ZADy8KGZIZqOhZ/PYSiDAqeUanMYCsMMpKKe34yhhsXNjuiNZxlkmoPMIgnR+9M4Qv2rqlW/2kiFAbEVv96GHH+TIT0tfUMlqpxc+3TJWMX+8xD8fdHU84INxFt5p0BEZypRJZEpkkzVEiPCoSU21apzT9CN8ew==0200a8BHiSlQ7Xj0QAH5+rpyfannbxj77iFokh+jdc1wj3QnxrLyjFAO6KfYaec0WujUdE7FOv2pV7Ch2WiJAwSz05VWbWY9zuHWVg24Ohl6XoLRS4E5nQMK1YKwZuCfl9otaVljrjcROtMv7kdaHFhQaq8vXd5m6XBiaJMnWXcQ==.1'
        ]
    }
    const cwTrustee1 = new crumbl.CrumblWorker(workerTrustee1)
    try {
        uncrumbled1 = await cwTrustee1.process()
        console.log(uncrumbled1)
    } catch (e) {
        errors.push(e)
        crumbl.logger.log(e, crumbl.ERROR)
    }

    let uncrumbled2 = ''
    const workerTrustee2: crumbl.Worker = {
        mode: crumbl.EXTRACTION,
        signerKeys: 'rsa:./test/src/typescript/crypto/rsa/keys/trustee2.pub',
        signerSecret: './test/src/typescript/crypto/rsa/keys/trustee2.sk',
        verificationHash: '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d',
        data: [
            crumbled ? crumbled : '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d0000a8BJTkFAnzpe4fPWZWbZwaI68NbLq++xD6tKPnFcl3yWnmUKI3Evk1Ax3WZbqsU1uurEcGH9Kfjdmgm+/qjaUSilBCUwTfXE/SgDTVY0OYnFe/g3xN7gwOTUEUF470c00LDo/ns1dXULzZw6iunztApfptXbUVR590WX8Jsg==010158NwuvJKqSgOQjPveYXoCepULX3NtYAVXMCBioeq8bFi+MZWJVTmzYYIsZSpNJ3QvXV3QcaQHVXlQrtR05QatnGkiJqy9a0KZjQRzrYhatNqv+2PqIoFMHQ+Z+uiOYca0GuDEu293xMsdRv8Bh3FfQaCR5vt1iyCsyHwS0wEkfx0ubkZii27nXJH4ZADy8KGZIZqOhZ/PYSiDAqeUanMYCsMMpKKe34yhhsXNjuiNZxlkmoPMIgnR+9M4Qv2rqlW/2kiFAbEVv96GHH+TIT0tfUMlqpxc+3TJWMX+8xD8fdHU84INxFt5p0BEZypRJZEpkkzVEiPCoSU21apzT9CN8ew==0200a8BHiSlQ7Xj0QAH5+rpyfannbxj77iFokh+jdc1wj3QnxrLyjFAO6KfYaec0WujUdE7FOv2pV7Ch2WiJAwSz05VWbWY9zuHWVg24Ohl6XoLRS4E5nQMK1YKwZuCfl9otaVljrjcROtMv7kdaHFhQaq8vXd5m6XBiaJMnWXcQ==.1'
        ]
    }
    const cwTrustee2 = new crumbl.CrumblWorker(workerTrustee2)
    try {
        uncrumbled2 = await cwTrustee2.process()
        console.log(uncrumbled2)
    } catch (e) {
        errors.push(e)
        crumbl.logger.log(e, crumbl.ERROR)
    }

    let uncrumbled = ''
    const workerOwner: crumbl.Worker = {
        mode: crumbl.EXTRACTION,
        ownerKeys: 'ecies:./test/src/typescript/crypto/ecies/keys/owner1.pub',
        ownerSecret: './test/src/typescript/crypto/ecies/keys/owner1.sk',
        verificationHash: '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d',
        data: [
            crumbled ? crumbled : '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d0000a8BJTkFAnzpe4fPWZWbZwaI68NbLq++xD6tKPnFcl3yWnmUKI3Evk1Ax3WZbqsU1uurEcGH9Kfjdmgm+/qjaUSilBCUwTfXE/SgDTVY0OYnFe/g3xN7gwOTUEUF470c00LDo/ns1dXULzZw6iunztApfptXbUVR590WX8Jsg==010158NwuvJKqSgOQjPveYXoCepULX3NtYAVXMCBioeq8bFi+MZWJVTmzYYIsZSpNJ3QvXV3QcaQHVXlQrtR05QatnGkiJqy9a0KZjQRzrYhatNqv+2PqIoFMHQ+Z+uiOYca0GuDEu293xMsdRv8Bh3FfQaCR5vt1iyCsyHwS0wEkfx0ubkZii27nXJH4ZADy8KGZIZqOhZ/PYSiDAqeUanMYCsMMpKKe34yhhsXNjuiNZxlkmoPMIgnR+9M4Qv2rqlW/2kiFAbEVv96GHH+TIT0tfUMlqpxc+3TJWMX+8xD8fdHU84INxFt5p0BEZypRJZEpkkzVEiPCoSU21apzT9CN8ew==0200a8BHiSlQ7Xj0QAH5+rpyfannbxj77iFokh+jdc1wj3QnxrLyjFAO6KfYaec0WujUdE7FOv2pV7Ch2WiJAwSz05VWbWY9zuHWVg24Ohl6XoLRS4E5nQMK1YKwZuCfl9otaVljrjcROtMv7kdaHFhQaq8vXd5m6XBiaJMnWXcQ==.1',
            uncrumbled1 ? uncrumbled1 : '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%02AgICAgJcRwkYUkI=.1',
            uncrumbled2 ? uncrumbled2 : '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%01AgICAnYEVQMOTg8=.1'
        ]
    }
    const cwOwner = new crumbl.CrumblWorker(workerOwner)
    try {
        uncrumbled = await cwOwner.process()
        console.log(uncrumbled)
    } catch (e) {
        errors.push(e)
        crumbl.logger.log(e, crumbl.ERROR)
    }

    if (source != uncrumbled) {
        crumbl.logger.log('unable to recover source', crumbl.ERROR)
    } else if (errors.length > 0) {
        crumbl.logger.log('some errors occurred: watch your logs', crumbl.WARNING)
    } else {
        crumbl.logger.log('process ok', crumbl.SUCCESS)
    }
}

main()