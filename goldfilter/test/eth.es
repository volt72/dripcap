import {Layer,
        Buffer,
        Msgpack} from 'dripcap';
import MACAddress from 'dripcap/mac';


class Enum
{
    constructor(table, value)
    {
        if (!(table instanceof Object)) {
            throw new TypeError('expected Object');
        }
        this.table = table;
        this.value = value;
    }

    get name()
    {
        let name = this.table[this.value];
        return name ? name : 'unknown';
    }

    get known()
    {
        return (this.table[this.value] != null);
    }

    toString()
    {
        return `${this.name} (${this.value})`;
    }

    toJSON()
    {
        return this.toString();
    }

    toMsgpack()
    {
        let table = {};
        if (this.known) {
            table[this.value] = this.table[this.value];
        }
        return [ 'dripcap/enum', table, this.value ];
    }

    equals(val)
    {
        return val.toString() === this.toString();
    }
}

export default class EthrenetDissector
{
    constructor(options)
    {
    }

    analyze(packet, parentLayer)
    {
        function assertLength(len)
        {
            if (parentLayer.payload.length < len) {
                throw new Error('too short frame');
            }
        }

        let layer = new Layer();
        layer.name = 'Ethernet';
        layer.namespace = '::Ethernet';

        assertLength(6);
        let destination = parentLayer.payload.slice(0, 6);
        layer.fields.push({
            name : 'MAC destination',
            attr : 'dst',
            data : destination
        });
        layer.attrs.dst = new MACAddress(destination);

        assertLength(12);
        let source = parentLayer.payload.slice(6, 12)
                         layer.fields.push({
                             name : 'MAC source',
                             attr : 'src',
                             data : source
                         });
        layer.attrs.src = new MACAddress(source);

        assertLength(14);
        let type = parentLayer.payload.readUInt16BE(12, true);
        if (type <= 1500) {
            layer.fields.push({
                name : 'Length',
                value : type,
                data : parentLayer.payload.slice(12, 14)
            });
        } else {
            let table = {
                0x0800 : 'IPv4',
                0x0806 : 'ARP',
                0x0842 : 'WoL',
                0x809B : 'AppleTalk',
                0x80F3 : 'AARP',
                0x86DD : 'IPv6'
            };

            let etherType = new Enum(table, parentLayer.payload.readUInt16BE(12, true));

            layer.fields.push({
                name : 'EtherType',
                attr : 'etherType',
                data : parentLayer.payload.slice(12, 14)
            });
            layer.attrs.etherType = etherType;

            if (etherType.known) {
                layer.namespace = `::Ethernet::<${etherType.name}>`;
            }
        }

        layer.payload = parentLayer.payload.slice(14);

        layer.fields.push({
            name : 'Payload',
            value : layer.payload,
            data : layer.payload
        });

        layer.summary = (layer.attrs.etherType) ? `[${layer.attrs.etherType.name}] ${layer.attrs.src} -> ${layer.attrs.dst}`
                                                : `${layer.attrs.src} -> ${layer.attrs.dst}`;

        parentLayer.layers[layer.namespace] = layer;
        return true;
    }
}
