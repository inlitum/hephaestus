import {OSRSItem} from "./populator/populate";
import {serialize, Type} from "class-transformer";

type MessageType = 'handshake' | 'information' | 'crud' | 'errored' | undefined;

export class HandshakeData {
    id: string | undefined;
}

export class InformationalData {
    information: number | undefined;
}

export class Itemstack {
    item: OSRSItem | undefined;

}

export class Message {
    @Type(() => Object, {
        discriminator: {
            property: '__type',
            subTypes: [
                { value: HandshakeData, name: 'handshake'},
                { value: InformationalData, name: 'information'},
                { value: Itemstack, name: 'itemstack'}
            ]
        },
        keepDiscriminatorProperty: true
    })
    data: HandshakeData | InformationalData | Itemstack | undefined;

}