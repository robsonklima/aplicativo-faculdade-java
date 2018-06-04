import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';

import { Config } from './../config/config';
import { Observable } from "rxjs/Observable";

@Injectable()
export class IndicadorService {
  constructor(
    private http: Http
  ) { }

  buscarGrfSLAFilialApi(): Observable<any> {
    return this.http.get(Config.API_URL + 'GrfSLAFilial')
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarGrfPendenciaFilialApi(): Observable<any> {
    return this.http.get(Config.API_URL + 'GrfPendenciaFilial')
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarGrfReincidenciaFilialApi(): Observable<any> {
    return this.http.get(Config.API_URL + 'GrfReincidenciaFilial')
      .timeout(60000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarGrfAcumuladoTecnicoApi(): Observable<any> {
    return this.http.get(Config.API_URL + 'GrfAcumuladoTecnico')
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarGrfPecasMaisTrocadasTecnicoApi(): Observable<any> {
    return this.http.get(Config.API_URL + 'GrfPecasMaisTrocadasTecnico')
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarGrfPecasMaisPendenciadasTecnicoApi(): Observable<any> {
    return this.http.get(Config.API_URL + 'GrfPecasMaisPendenciadasTecnico')
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarGrfSLATecnicoApi(): Observable<any> {
    return this.http.get(Config.API_URL + 'GrfSLATecnico')
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }

  buscarGrfSLAMelhorTecnicoApi(): Observable<any> {
    return this.http.get(Config.API_URL + 'GrfSLAMelhorTecnico')
      .timeout(20000)
      .map((res: Response) => res.json())
      .catch((error: any) => Observable.throw(error.json()));
  }
}