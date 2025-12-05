// const {
//   parseExcel,
//   parseCSV,
//   parseSheetFile,
// } = require("../../../helpers/excel/parseExcel");
// const {
//   getBrevoInstance,
// } = require("../../../emails/helpers/getBrevoInstance");
// const {
//   createUpdateContact,
// } = require("../../../emails/helpers/createUpdateContact");
// const SibApiV3Sdk = require("sib-api-v3-sdk");

export default {
  // async getLists(ctx) {
  //   // TODO: here, get the current club mailing folder id
  //   // PS: it should be created when creating a new club,
  //   // const folderId = 5;
  //   // \\
  //   const { withContacts, folderId } = ctx.query;
  //   try {
  //     const apiInstance = await getBrevoInstance("ContactsApi");
  //     const data = await apiInstance.getFolderLists(folderId);
  //
  //     if (withContacts) {
  //       const listsWithContacts = await Promise.all(
  //         (data?.lists || [])?.map(async (list) => {
  //           const contactsResponse = await apiInstance.getContactsFromList(
  //             list.id
  //           );
  //           return {
  //             ...list,
  //             contacts: contactsResponse.contacts || [],
  //           };
  //         })
  //       );
  //       return ctx.send(listsWithContacts);
  //     }
  //     return ctx.send(data);
  //   } catch (error) {
  //     console.error("Error fetching contact lists:", error);
  //     return ctx.internalServerError(
  //       "An error occurred while fetching contact lists."
  //     );
  //   }
  // },
  // async createList(ctx) {
  //   try {
  //     // TODO: here, get the current club mailing folder id
  //     // PS: it should be created when creating a new club,
  //     const folderId = 5;
  //     // \\
  //     const { name } = ctx.request.body;
  //
  //     if (!name) {
  //       return ctx.badRequest("Le nom de la liste est obligatoire !");
  //     }
  //
  //     const apiInstance = await getBrevoInstance("ContactsApi");
  //
  //     const response = await apiInstance.createList({
  //       name,
  //       folderId,
  //     });
  //
  //     if (ctx.request.files) {
  //       const { files } = ctx.request.files;
  //       const contacts = await parseSheetFile(files);
  //
  //       const addContactsPromises = contacts.map(async (contact) => {
  //         await createUpdateContact(contact, response.id);
  //       });
  //
  //       await Promise.all(addContactsPromises);
  //     }
  //
  //     //TODO return as getList
  //
  //     ctx.send({
  //       message: "Contact list created successfully.",
  //       list: response,
  //     });
  //   } catch (error) {
  //     console.error("Error creating contact list:", error);
  //     ctx.internalServerError(
  //       "An error occurred while creating the contact list."
  //     );
  //   }
  // },
  // async updateList(ctx) {
  //   try {
  //     const { name } = ctx.request.body;
  //     const { listId } = ctx.params;
  //
  //     if (!listId) {
  //       return ctx.badRequest("L'identifiant de la liste est obligatoire !");
  //     }
  //
  //     const apiInstance = await getBrevoInstance("ContactsApi");
  //
  //     let response = await apiInstance.getList(listId);
  //     if (response.name?.trim() !== name?.trim() && !!name) {
  //       await apiInstance.updateList(listId, {
  //         name,
  //       });
  //       response.name = name;
  //     }
  //
  //     // if (ctx.request.files) {
  //     //   const { files } = ctx.request.files;
  //     //   const contacts = await parseSheetFile(files);
  //     //
  //     //   const existingContactsResponse = await apiInstance.getContactsFromList(
  //     //     listId
  //     //   );
  //     //   const existingContacts = existingContactsResponse.contacts || [];
  //     //
  //     //   const removeContactsPromises = existingContacts.map((contact) => {
  //     //     console.log(contact?.listIds?.filter((_) => _ !== listId));
  //     //
  //     //     return apiInstance.updateContact(contact.email, {
  //     //       listIds: contact?.listIds?.filter((_) => _ !== listId) || [],
  //     //     });
  //     //   });
  //     //   await Promise.all(removeContactsPromises);
  //     //
  //     //   const addContactsPromises = contacts.map(async (contact) => {
  //     //     await createUpdateContact(contact, listId);
  //     //   });
  //     //
  //     //   await Promise.all(addContactsPromises);
  //     // }
  //
  //     ctx.send({
  //       message: "Contact list updated successfully.",
  //       list: response,
  //     });
  //   } catch (error) {
  //     console.error("Error updating contact list:", error);
  //     ctx.internalServerError(
  //       "An error occurred while updating the contact list."
  //     );
  //   }
  // },
  // async deleteContactFromList(ctx) {
  //   try {
  //     const { email } = ctx.request.body;
  //     const { listId } = ctx.params;
  //
  //     if (!email || !listId) {
  //       return ctx.badRequest(
  //         "L'e-mail et l'identifiant de liste sont obligatoires."
  //       );
  //     }
  //
  //     const apiInstance = await getBrevoInstance("ContactsApi");
  //
  //     const contact = await apiInstance.getContactInfo(email);
  //
  //     if (!contact || !contact.listIds || !contact.listIds.includes(listId)) {
  //       return ctx.notFound(
  //         "Le contact n'est pas abonné à la liste spécifiée."
  //       );
  //     }
  //     const updatedListIds = contact.listIds.filter((id) => id !== listId);
  //
  //     await apiInstance.updateContact(email, { listIds: updatedListIds });
  //
  //     ctx.send({
  //       message: "Le contact a été supprimé de la liste avec succès.",
  //       contact: { email, updatedListIds },
  //     });
  //   } catch (error) {
  //     console.error(
  //       "Erreur lors de la suppression du contact de la liste :",
  //       error
  //     );
  //
  //     if (error.response && error.response.status === 404) {
  //       return ctx.notFound("Contact non trouvé.");
  //     }
  //
  //     ctx.internalServerError(
  //       "Une erreur s'est produite lors de la suppression du contact de la liste."
  //     );
  //   }
  // },
};
