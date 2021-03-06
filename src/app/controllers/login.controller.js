
  angular
  .module("mainApp")
  .controller('LoginController', function(
    $rootScope,
    $scope,
    $state,
    HelperAPI, 
    $window,
    $cookies,
    $base64,
    LocalStorage,
    ErrorService
  ) {
    $rootScope.doLoggingIn = true;
    var query = {
      method: 'GET',
      url: 'https://login.xero.com/identity/connect/authorize',
      params: {
        response_type : 'code',
        client_id: cliend_id,
        redirect_uri: `${rootUrl}/callback`,
        scope: 'openid profile email offline_access accounting.transactions accounting.contacts',
        state: '123',
        client_secret: cliend_secret
      }
    }
    var needLogin = true, code;
    function check(){
      /* check login step 3*/
      $rootScope.credentials = {
        'access_token' : LocalStorage.get('access_token') || undefined
      };
      console.log('credentials', $rootScope.credentials);
      needLogin = !$rootScope.credentials.access_token;
      /* check login */
      if(!needLogin) { logInResult(true); return; }

      /* get code from result step 2*/
      code = $cookies.get('code');
      console.log(`code = ${code}`);

      if(!code) { logInResult(false); return; }   
      /* base64 encode */
      var x = $base64.encode(query.params.client_id+':'+query.params.client_secret);
      var y = btoa(query.params.client_id+':'+query.params.client_secret);
      var authorization = x? x: y;
      /* ------------- */
      
      /* get token step 2 */
      HelperAPI.call({
        method: 'POST',
        url: 'https://identity.xero.com/connect/token',
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'authorization': 'Basic ' + authorization
        },
        params: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: query.params.redirect_uri,
        }
      })
      .then(data => {
        let credentials = data.data;
        $cookies.remove('code');
        _.forOwn(credentials, (value, key) => {
          LocalStorage.set(key, value);
        });
        logInResult(true);
      })
      .catch(error => {
        logInResult(false);
        console.error(error);
      })
    
    };
    check();
    if(!needLogin || code) return;
    /* start get code step 1*/
    $window.location.href = `${query.url}?response_type=${query.params.response_type}&client_id=${query.params.client_id}&redirect_uri=${query.params.redirect_uri}&scope=${query.params.scope}&state=${query.params.state}`;
    /*************** FUNCTION ****************/
    function logInResult(result) {
      if(result) $rootScope.isLogged = true;
      $scope.resultLogin = result;
      $scope.loggingIn = false;
      console.log('result login -> ', result);
      if(result) {
        // $rootScope.$broadcast('needLoadOrgs', {
        //   value: 1
        // });
        $state.go('contact'); 
      } else {
        ErrorService.error('Login: fail! Please login again', 1000);
      }
      $rootScope.doLoggingIn = false;
    };

  })
