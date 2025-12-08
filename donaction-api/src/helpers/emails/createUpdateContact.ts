// const { getBrevoInstance } = require("./getBrevoInstance");

import getBrevoInstance from "./getBrevoInstance";

interface IContact {
  firstName: string;
  lastName: string;
  email: string;
  listIds?: Array<number>
}
export default async function createUpdateContact(contact: IContact, listId: number) {
  // const apiInstance = await getBrevoInstance("ContactsApi");
  // try {
  //   const registered = await apiInstance.getContactInfo(contact.email);
  //   const updatedListIds = new Set([...(contact?.listIds || []), listId]);
  //   return apiInstance.updateContact(registered.email, {
  //     listIds: Array.from(updatedListIds),
  //     attributes: {
  //       PRENOM: contact.firstName,
  //       NOM: contact.lastName,
  //     },
  //   });
  // } catch (e) {
  //   return apiInstance.createContact({
  //     email: contact.email,
  //     attributes: {
  //       PRENOM: contact.firstName,
  //       NOM: contact.lastName,
  //     },
  //     listIds: [listId],
  //   });
  // }
}

