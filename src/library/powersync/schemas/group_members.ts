import { column, Table } from "@powersync/react-native";
import { GroupMemberRecord } from "./AppSchema";

export interface GroupMemberType {
    id: string
    group_id: string
    member_id: string
    member_type: string
    sync_id: string
}


export default new Table({
    id: column.text,
    group_id: column.text,
    member_id: column.text,
    member_type: column.text,
    sync_id: column.text,
},
{
    indexes: {
        GroupMember: ['group_id', 'member_id'],
    },
}
);

export const buildMember = (groupMember: GroupMemberType): GroupMemberRecord => {
    const { id, group_id, member_id, member_type, sync_id } = groupMember
    return {
        id,
        group_id,
        member_id,
        member_type,
        sync_id
    }
}

