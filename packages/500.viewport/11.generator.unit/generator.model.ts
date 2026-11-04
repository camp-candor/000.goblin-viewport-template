import Generator, {
    GeneratorParams,
    ScaffoldingReceipt,
} from './fce/generator.interface'

export class GeneratorModel implements Generator {
    idx: string = '11.generator.unit'
    activeParams?: GeneratorParams
    lastReceipt?: ScaffoldingReceipt
    lastStatus: string = 'IDLE'
}
