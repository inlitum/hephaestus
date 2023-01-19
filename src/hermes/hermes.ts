import { error }                  from 'winston';
import { Loggable }               from '../lib/loggable';
import generateControllerFromName from '../controllers/controller-factory';

export class Hermes extends Loggable {

    private static instance: Hermes;
    private routes: { [ route: string ]: { controller: Object, functionName: string}};

    private controllers: { [ controllerName: string ]: Object };

    public constructor () {
        super ('Hermes');
        this.id = 'Hermes';
        if (Hermes.instance != null) {
            throw error ('Hermes instance can only be initialised once.');
        }
        Hermes.instance  = this;
        this.routes      = {};
        this.controllers = {};
    }

    public static registerRoute (route: string, controller: string) {
        if (Hermes.instance.routes[ route ] != null || controller.split ('.').length !== 2) {
            Hermes.instance.logger.warning (`Route [${route}] is already assigned.`);
            return;
        }

        let split = controller.split ('.');

        Hermes.instance.logger.info (`Assigning new route [${route}] to point towards [${controller}]`);

        let controllerName = split[ 0 ];
        let functionName   = split[ 1 ];

        let c;
        if (Hermes.instance.controllers[ controllerName ] != null) {
            c = Hermes.instance.controllers[ controllerName ];
        } else {
            c                                             = generateControllerFromName (controllerName);
            Hermes.instance.controllers[ controllerName ] = c;
        }

        // @ts-ignore
        // console.log(c)

        // @ts-ignore
        Hermes.instance.routes[ route ] = {
            controller: c,
            functionName: functionName
        }
        console.log(Hermes.instance.routes)
    }

    public static handleRoute (route: string, data: any) {
        if (Hermes.instance.routes[ route ] == null) {
            console.log ('No route registered for route: ' + route);
            return;
        }

        let r = Hermes.instance.routes[ route ];

        let c = r.controller;
        let fn = r.functionName;

        // @ts-ignore
        c[fn](data);
    }

}