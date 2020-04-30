import { AnalysisOptions } from './types';
import Engine from './engine';
export = Analyzer;
declare class Analyzer {
    constructor(engine: Engine, options?: AnalysisOptions);
    calculate(callback: (evaluation: number) => any): void;
    evaluation: number;
    options: AnalysisOptions;
    startTime: number;
}
