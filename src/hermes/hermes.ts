import { error }                  from 'winston';
import { Loggable }               from '../lib/loggable';
import generateControllerFromName from '../controllers/controller-factory';
import { Message }                from '../message-types';
import { WebsocketController }    from '../ws-server/websocket-controller';

/**
 * Used to handle route requests from clients.
 */
export class Hermes extends Loggable {

    // The single instance of Hermes across the app.
    private static instance: Hermes;
    // Stored internal routes.
    private routes: { [ route: string ]: { controller: Object, functionName: string } };
    // Saved controllers.
    private controllers: { [ controllerName: string ]: Object };

    public constructor () {
        // set the logger name.
        super ('Hermes');
        this.id = 'Hermes';
        if (Hermes.instance != null) {
            throw this.logger.error ('Hermes instance can only be initialised once.');
        }
        Hermes.instance  = this;
        this.routes      = {};
        this.controllers = {};
    }

    /**
     * Links a route to a single controller.
     * @param route The route used to reference the controller via requests.
     */
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
            c = generateControllerFromName (controllerName);

            Hermes.instance.controllers[ controllerName ] = c;
        }

        // @ts-ignore
        // console.log(c)

        // @ts-ignore
        Hermes.instance.routes[ route ] = {
            controller: c,
            functionName: functionName
        };
    }

    public static async handleRoute (route: string, request: Message) {
        if (Hermes.instance.routes[ route ] == null) {
            console.log ('No route registered for route: ' + route);
            return;
        }

        let r = Hermes.instance.routes[ route ];

        let c  = r.controller;
        let fn = r.functionName;

        // @ts-ignore
        let response = await c[ fn ] (request.data);
        if (response != null) {
            if (request.websocketId == null) {
                this.instance.logger.error ('Invalid request sent to Hermes, no websocket ID.');
                return;
            }
            WebsocketController.send (request.websocketId, JSON.stringify (response) ?? '');
        }
    }

}