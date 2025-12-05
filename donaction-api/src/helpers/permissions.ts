import { MEMBER_ROLES } from './memberRoles';
import { USER_ROLES } from './userRoles';
import { KlubrMemberEntity, UserEntity } from '../_types';

const isAdmin = (user: UserEntity) => user.role?.name === USER_ROLES.Admin.name;

const isAdminEditor = (user: UserEntity) =>
    user.role?.name === USER_ROLES.AdminEditor.name;
const isAtLeastAdminEditor = (user: UserEntity) =>
    USER_ROLES[user.role.name].weight >= USER_ROLES.AdminEditor.weight;

const isNetwork = (user: UserEntity) =>
    user.role?.name === USER_ROLES.NetworkLeader.name;
const isAtLeastNetwork = (user: UserEntity) =>
    USER_ROLES[user.role.name].weight >= USER_ROLES.NetworkLeader.weight;

const isLeader = (user: UserEntity) =>
    user.role?.name === USER_ROLES.KlubMemberLeader.name;
const isAtLeastLeader = (user: UserEntity) =>
    USER_ROLES[user.role.name].weight >= USER_ROLES.KlubMemberLeader.weight;

// TODO: check here (added .name for user.role)
const isMember = (user: UserEntity) =>
    user.role.name === USER_ROLES.KlubMember.name;
const isAtLeastMember = (user: UserEntity) =>
    USER_ROLES[user.role.name].weight >= USER_ROLES.KlubMember.weight;

// TODO: check here (added .name for user.role)
const isAuthenticated = (user: UserEntity) =>
    user.role.name === USER_ROLES.Authenticated.name;
const isAtLeastAuthenticated = (user: UserEntity) =>
    USER_ROLES[user.role.name].weight >= USER_ROLES.Authenticated.weight;

const memberIsAdmin = (member: KlubrMemberEntity) =>
    member.role === MEMBER_ROLES.Admin.name;
const memberIsAdminEditor = (member: KlubrMemberEntity) =>
    member.role === MEMBER_ROLES.AdminEditor.name;
const memberIsNetwork = (member: KlubrMemberEntity) =>
    member.role === MEMBER_ROLES.NetworkLeader.name;
const memberIsLeader = (member: KlubrMemberEntity) =>
    member.role && member.role === MEMBER_ROLES.KlubMemberLeader.name;
const memberIsAtLeastLeader = (member: KlubrMemberEntity) =>
    member.role &&
    MEMBER_ROLES[member.role].weight >= MEMBER_ROLES.KlubMemberLeader.weight;
const memberIsMember = (member: KlubrMemberEntity) =>
    member.role === MEMBER_ROLES.KlubMember.name;
const memberIsAtLeastMember = (member: KlubrMemberEntity) =>
    member.role &&
    MEMBER_ROLES[member.role].weight >= MEMBER_ROLES.KlubMember.weight;

const profileIsKlubrAdmin = (profile: KlubrMemberEntity) =>
    memberIsAdmin(profile);
const profileIsKlubrAdminEditor = (
    profile: KlubrMemberEntity,
    klubrUuid: string,
) => memberIsAdminEditor(profile) && profile.klubr?.uuid === klubrUuid;
const profileIsKlubrNetwork = (profile: KlubrMemberEntity, klubrUuid: string) =>
    memberIsNetwork(profile) && profile.klubr?.uuid === klubrUuid;
const profileIsKlubrLeader = (profile: KlubrMemberEntity, klubrUuid: string) =>
    memberIsLeader(profile) && profile.klubr?.uuid === klubrUuid;
const profileIsAtLeastKlubrLeader = (
    profile: KlubrMemberEntity,
    klubrUuid: string,
) => memberIsAtLeastLeader(profile) && profile.klubr?.uuid === klubrUuid;
const profileIsKlubrMember = (profile: KlubrMemberEntity, klubrUuid: string) =>
    memberIsMember(profile) && profile.klubr?.uuid === klubrUuid;
const profileIsAtLeastKlubrMember = (
    profile: KlubrMemberEntity,
    klubrUuid: string,
) => memberIsAtLeastMember(profile) && profile.klubr?.uuid === klubrUuid;

const isKlubrAdmin = (user: UserEntity, klubrUuid: string) =>
    user.klubr_membres.some(
        (m) => memberIsAdmin(m) && m.klubr?.uuid === klubrUuid,
    );
const isKlubrAdminEditor = (user: UserEntity, klubrUuid: string) =>
    user.klubr_membres.some(
        (m) => memberIsAdminEditor(m) && m.klubr?.uuid === klubrUuid,
    );
const isKlubrNetwork = (user: UserEntity, klubrUuid: string) =>
    user.klubr_membres.some(
        (m) => memberIsNetwork(m) && m.klubr?.uuid === klubrUuid,
    );
const isKlubrLeader = (user: UserEntity, klubrUuid: string) =>
    user.klubr_membres.some(
        (m) => memberIsLeader(m) && m.klubr?.uuid === klubrUuid,
    );
const isAtLeastKlubrLeader = (user: UserEntity, klubrUuid: string) =>
    user.klubr_membres.some(
        (m) => memberIsAtLeastLeader(m) && m.klubr?.uuid === klubrUuid,
    );
const isKlubrMember = (user: UserEntity, klubrUuid: string) =>
    user.klubr_membres.some(
        (m) => memberIsMember(m) && m.klubr?.uuid === klubrUuid,
    );
const isAtLeastKlubrMember = (user: UserEntity, klubrUuid: string) =>
    user.klubr_membres.some(
        (m) => memberIsAtLeastMember(m) && m.klubr?.uuid === klubrUuid,
    );

const roleIsGreaterThan = (role1: string, role2: string) =>
    USER_ROLES[role1]?.weight > USER_ROLES[role2]?.weight;
const roleIsAtLeast = (role1: string, role2: string) =>
    USER_ROLES[role1]?.weight >= USER_ROLES[role2]?.weight;
const roleIsEqualTo = (role1: string, role2: string) =>
    USER_ROLES[role1]?.weight === USER_ROLES[role2]?.weight;

export {
    isAdmin,
    isAdminEditor,
    isAtLeastAdminEditor,
    isNetwork,
    isAtLeastNetwork,
    isLeader,
    isAtLeastLeader,
    isMember,
    isAtLeastMember,
    isAuthenticated,
    isAtLeastAuthenticated,
    memberIsNetwork,
    memberIsLeader,
    memberIsAtLeastLeader,
    memberIsMember,
    memberIsAtLeastMember,
    profileIsKlubrAdmin,
    profileIsKlubrAdminEditor,
    profileIsKlubrNetwork,
    profileIsKlubrLeader,
    profileIsAtLeastKlubrLeader,
    profileIsKlubrMember,
    profileIsAtLeastKlubrMember,
    isKlubrAdmin,
    isKlubrAdminEditor,
    isKlubrNetwork,
    isKlubrLeader,
    isAtLeastKlubrLeader,
    isKlubrMember,
    isAtLeastKlubrMember,
    roleIsGreaterThan,
    roleIsAtLeast,
    roleIsEqualTo,
};
