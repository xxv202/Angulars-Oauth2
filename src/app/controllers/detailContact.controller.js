(function (){
  'use strict';
  
  angular
  .module("mainApp")
  .controller("DetailContactController", 
    function($scope, $uibModalInstance, Contact) {
        console.log('Contacts', Contact);
        $scope.contact = Contact;
        
        $scope.ok = function () {
           $uibModalInstance.close({
               edit: 1
           });
       };

       $scope.cancel = function () {
           $uibModalInstance.dismiss('cancel');
       };
   })

})();