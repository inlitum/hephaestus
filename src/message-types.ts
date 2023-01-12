export interface Message {
    type: string;
    data: HandshakeData | any;
}

export interface HandshakeData {
    id: string;
}