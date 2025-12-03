## Services
this folder will contain any API call made through the app, these api calls must be written inside the modulesService folder,
inside the services folder you'll find a httpService folder which is a Singleton Axios instance to make your calls, if your project for example needs a socket.io connection then you need to add it inside the socketServices folder.
* httpService (services/index.ts):
    * this file is an axios instance (interceptor), that is configured to run your API calls, inside
      this file you'll find a class with various methods, but none of them is accessible except the `getInstance()` and `executeRequest()` methods.
    * inside the file you'll find configuration to update the token and reExecute the fallen requests all with persisting the actual behaviour of the UI.
    * how to use the `executeRequest()` method: `HttpService.getInstance().executeRequest(...config)`, there is an example in modulesServices folder.
* modulesServices:
    * all of your store API needs must be implemented in this folder.

## Store
Redux store, contains modules folder, hooks and index files:
* modules folder: contains the store slices that are needed to compose your app, a brief example exists in there.
* index: exports your created modules.
* hooks: exports `useAppSelector` and `useAppDispatch` which are typed instead of simple `useSelector` and `useDispatch`.