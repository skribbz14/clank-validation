/*
//
/// Clank Validation
/// version 0.1

Clank Validation is a module to supply client-side form validation. Clank Validation currently
supports the follow list of field types:
  - input[type="text"]
  - input[type="email"]
  - input[type="radio"]
  - input[type="checkbox"]
  - input[type="range"]
  - input[type="color"]
  - input[type="month"]
  - input[type="time"]
  - input[type="date"]
  - input[type="datetime-local"]
  - input[type="search"]
  - input[type="file"]       
  - input[type="url"]       
  - input[type="tele"]       
  - input[type="number"]                    
  - textarea
  - select

- To initialize Clank Validation on a form add the "clank-validation" attribute to a <form> element.
  - EX. <form clank-validation></form>


- To use a custom module classname, instead of 'clank_validation', give the clank-validation attribute a value.
  - EX. <form clank-validation="error_message"></form>
  

- You may specify the button that triggers the validation, in case you have multiple input[type="submit"] or
  your unique case requires it, by using the "clank-validation-button" and passing it a selector value. It
  is important to note that the button must be inside of the form for it to work.
  - EX. <form clank-validation clank-validation-button="#submit">


- You can create custom pass/fail messages by using the attributes "clank-validation-fail" & "clank-validation-pass".
  - EX. <input type="text" clank-validation-fail="Please choose a browser" clank-validation-pass="Correct!" required>


- You may specify a min/max character limit on all textboxes using the "clank-validation-min" and 
  "clank-validation-max" attributes on the given input.
  - EX. <input type="text" clank-validation-min="5" clank-validation-max="15" required>


- Selectboxes can specify if whether or not the default answer is invalid or not using 
  the "clank-validation-default" attribute.
  - EX. <select clank-validation-default="invalid" required>
  

- Checkboxes can specify whether they have a minimum or maximum requirement by setting
  the "clank-validation-min" or "clank-validation-max" attribute on the first checkbox in the group.
  - EX. <input type="checkbox" name="checkbox_group" value="example" clank-validation-min="2" clank-validation-max="4" required>
  

- Checkboxes and radio buttons can specify where the error message should be inserted in the DOM
  using the "clank-validation-insert-after" attribute on the first item in the group and passing 
  it a selector value. It's important to note that this will not have the <validation-message> printed 
  within the given selector, but inserted immediately after the qualified element. 
  - EX. <input type="checkbox" name="checkbox_group" value="example" clank-validation-insert-after=".any_selector_type" required>
  

- Color fields have the ability for you to declare black as invalid using 
  the "clank-validation-black-invalid" attribute.
  - EX. <input type="color" clank-validation-black-invalid="true" required>
  
  
- Range fields can be have their default value specified to be invalid by applying the 
  "clank-validation-default" attribute to the range input. 
  - EX. <input type="range" value="0" min="0" max="10" clank-validation-default="0" required>



@remember - The validation looks for the 'required' attribute, as well, 
            a 'required' class on field items within a form.

@remember - Transition attribute starts as "paused" and goes to "play".

@remember - Status attribute allows for styling of message types

@remember - This module relies on checkValidity() which is not supported in IE9

@remember - If any radio button or checkbox in it's group has a required the group will be validated

@remember - The first checkbox/radio button in the group is the one that needs the attributes 

@remember - Auto-validation does not work for file fields  
  
  


  

*/


(function(){ 'use strict';
  
  /*
  //
  /// Definition */
  
  angular.module('clankValidation', [])
    .directive('clankValidation', function(){
            
      
      /*
      //
      /// Functions */
      
      /// HELPER FUNCTIONS
    	function Create_Validation_Obj(type){
      	/// @def - Returns an error object
      	
      	
      	/// The default type is set to fail if no type declared
      	if (typeof type === 'undefined') type = 'fail';
      	
      	
      	/// Create error object
      	var error = {};
        
        
        /// Set parameters based on type     	
      	switch(type){        	
        	case 'fail':        	
          	error = { pass:false, message:'fail' };        	
        	  break;
        	case 'pass':
          	error = { pass:true, message:'pass' };  
        	  break;          
          default:break;
      	}
               	
        
        return error;
    	}    	
      
      function Create_Validation_Message(field, check, attrs){
        /// @def - Creates all elements, initializes them and appends them to DOM        
        
        
        /// Variables
        var field_container = field.parentElement,
            module_classname = (attrs.clankValidation === '')
                                  ? 'clank_validator' : attrs.clankValidation.replace(/\s/g, '_'),
            message = (field_container.querySelector('validation-message') === null)
                        ? document.createElement('p') : field_container.querySelector('.'+module_classname+'--message'),
                        
            container = (field_container.querySelector('validation-message') === null) 
                          ? document.createElement('validation-message') : field_container.querySelector('validation-message');


        /// Initialize container
        container.className = module_classname;
        container.setAttribute('transition', 'paused');        
        if(check.pass === true) container.setAttribute('status', 'passed');
        else container.setAttribute('status', 'failed');        


        /// Initialize message
        message.className = module_classname+'--message';
        message.innerHTML = check.message;
        
        
        /// Append message to container
        container.appendChild(message);
        
        
        /// Append error message to field
        field_container.appendChild(container);
        
        
        /// Append a class to the clank_error container, after being created, so it would be possible to transition them
        setTimeout(function(e){ container.setAttribute('transition', 'play'); }, 300);
      }	      
      
      function Get_Field_Type(field){
        /// @def - Returns the type of element        
        
        var tag = field.tagName;
        
        if(tag === 'INPUT'){
          return field.type;
        }
        
        return tag;
      }    
      
      function Get_Radio_Groups(elem){
        /// @def - Returns an array of each radio group name
        
        
        /// Variables
        var known_groups = [],
            all_radios = elem.find('input[type="radio"]');
                        
        
        /// Go through each radio button to find the different groups
        all_radios.each(function(e){
          
          
          /// If this button is not required skip it
          if(!this.hasAttribute('required')) return;
          
          
          /// Variables
          var radio_group = {
    
                /// Find the name of the radio button's group
                name: this.name, 
                
                /// Used to specify where the validation message will be inserted 
                container: null, 
                
                /// Check for custom validation messages
                pass_message: (this.hasAttribute('clank-validation-pass')) ? this.getAttribute('clank-validation-pass') : null,
                fail_message: (this.hasAttribute('clank-validation-fail')) ? this.getAttribute('clank-validation-fail') : null               
              },
              
              /// A boolean to find out whether or not this group has been added
              group_already_set = false; 
          
          
          /// Checks if the user specified a container for the validation message
          if(this.hasAttribute('clank-validation-insert-after')) radio_group.container = this.getAttribute('clank-validation-insert-after');
                    

          /// Check if the radio button belongs to an already known group
          known_groups.forEach(function(i){              
            if(i.name === radio_group.name) group_already_set = true;
          });          
          
          
          /// If this radio button belongs to a new group, add the group
          if(!group_already_set) known_groups.push(radio_group); 
                                                                                        
        });
             
               
        return known_groups;
      }   

      function Get_Checkbox_Groups(elem){
        /// @def - Returns an array of each checkbox group name
        
        
        /// Variables
        var known_groups = [],
            all_boxes = elem.find('input[type="checkbox"]');
        
        
        /// Go through each checkbox to find the different groups
        all_boxes.each(function(e){
          
          
          /// If this button is not required skip it
          if(!this.hasAttribute('required')) return;
          
          
          /// Variables
          var checkbox_group = {
            
                /// Find the name of the radio button's group
                name: this.name, 
                
                /// The minimum checks required for positive validation
                min: 0, 
                
                /// The maximum checks required for a failed validation
                max: 0, 
                
                /// The parent wrapper that the validation should be printed within
                container: null, 
                
                /// Check for custom validation messages
                pass_message: (this.hasAttribute('clank-validation-pass')) ? this.getAttribute('clank-validation-pass') : null,
                fail_message: (this.hasAttribute('clank-validation-fail')) ? this.getAttribute('clank-validation-fail') : null                  
              },
              group_already_set = false; /// A boolean to find out whether or not this group has been added                            
          

          /// Check if there was a minimum value rule set for the group
          if(this.hasAttribute('clank-validation-min')) checkbox_group.min = this.getAttribute('clank-validation-min');
          
          
          /// Checks if there was a maximum value rule set for the group
          if(this.hasAttribute('clank-validation-max')) checkbox_group.max = this.getAttribute('clank-validation-max');
          
          
          /// Checks if the user specified a container for the validation message
          if(this.hasAttribute('clank-validation-insert-after')) checkbox_group.container = this.getAttribute('clank-validation-insert-after');
          
          
          /// Check if the checkbox belongs to an already known group
          known_groups.forEach(function(i){                          
            if(i.name === checkbox_group.name) group_already_set = true;                   
          });  
                    
                    
          /// If this checkbox belongs to a new group, add the group
          if(group_already_set === false){
            known_groups.push(checkbox_group);                                                                                         
          } 
        });
             
               
        return known_groups;
      }  
      
      function Get_Form_Fields(elem){        
        /// @def - Returns an array of every field that can be validated
        
        
        /// Grab fields
        var all_fields = [],
            textareas = elem.find('textarea'),
            selectboxes = elem.find('select'),  
            files = elem.find('input[type="file"]'),
            textboxes = elem.find('input[type="text"], input[type="email"], input[type="password"], input[type="number"], input[type="search"], input[type="tel"], input[type="url"], input[type="date"], input[type="datetime-local"], input[type="time"], input[type="month"], input[type="color"], input[type="range"]');

            
        
        /// Add all textboxes
        textboxes.each(function(e){
          all_fields.push(this);
        });
        
        
        /// Add all textareas
        textareas.each(function(e){
          all_fields.push(this);
        });
        
        
        /// Add all select boxes
        selectboxes.each(function(e){
          all_fields.push(this);
        });
        
        
        /// Add all file fields
        files.each(function(e){
          all_fields.push(this);
        });
        
        
        return all_fields;
      }
      
      function Submit_Form(check_list, elem){
        /// @def - Checks if any tests failed and submits the form if not

        
        /// Variables
        var fail_count = 0;
        
        
        /// Run through the checklist
        check_list.forEach(function(e){
          if(e.pass === false) fail_count++;
        });
        

        /// Submit the form if no fails
        if(fail_count === 0) elem[0].submit();
      }     
      
      
      /// VALIDATION FUNCTIONS
      function Check_Text_Field(field){
        /// @def - Validates various text boxes
        
        
        /// Variables
        var error = Create_Validation_Obj(),
            min_value = (field.hasAttribute('clank-validation-min')) ? field.getAttribute('clank-validation-min') : null,
            max_value = (field.hasAttribute('clank-validation-max')) ? field.getAttribute('clank-validation-max') : null,
            pass_message = (field.hasAttribute('clank-validation-pass')) ? field.getAttribute('clank-validation-pass') : null,
            fail_message = (field.hasAttribute('clank-validation-fail')) ? field.getAttribute('clank-validation-fail') : null;
        

        if(field.value === ''){
          if(fail_message === null) error.message = 'Textbox is empty';
          else error.message = fail_message;
        }
        
        else if(field.type === 'email' && field.value.indexOf('.') === -1){          
          if(fail_message === null) error.message = 'Invalid email address';
          else error.message = fail_message;          
        }         
         
        else if(min_value !== null && field.value.length < min_value){          
          if(fail_message === null) error.message = 'Must be at least '+min_value+' characters long';
          else error.message = fail_message;                    
        }     
        
        else if(max_value !== null && field.value.length > max_value){          
          if(fail_message === null) error.message = 'You can only enter '+max_value+' characters';
          else error.message = fail_message;             
        }    
          
        else if(!field.checkValidity()){    
          if(field.type === 'url'){
            if(fail_message === null) error.message = 'A url must begin with http://';
            else error.message = fail_message;              
          } 
          else{
            if(fail_message === null) error.message = 'Textbox is invalid';
            else error.message = fail_message;                         
          }     
        }
                
        else {
          error.pass = true;           
          if(pass_message === null) error.message = 'Pass';
          else error.message = pass_message;            
        }
        
        return error;
      }
      
      function Check_Selectbox(field){
        /// @def - Returns error object of validated selectbox
        
        
        /// Variables
        var error = Create_Validation_Obj(),
            selected_value = field.value,
            default_invalid = (field.hasAttribute('clank-validation-default')) ? field.getAttribute('clank-validation-default') : false,
            default_value = field.firstChild.value,
            pass_message = (field.hasAttribute('clank-validation-pass')) ? field.getAttribute('clank-validation-pass') : null,
            fail_message = (field.hasAttribute('clank-validation-fail')) ? field.getAttribute('clank-validation-fail') : null;
        
        
        /// If the user has set the selectbox's default value to invalid
        if(default_invalid === 'invalid' && selected_value === default_value){
          if(fail_message === null) error.message = 'You must select an option';
          else error.message = fail_message;             
        }

        
        /// If the value is empty, tell it to select an option
        else if(selected_value === ''){
          if(fail_message === null) error.message = 'You must select an option';
          else error.message = fail_message;
        }
        
        
        /// Pass the selection
        else{
          error.pass = true;
          if(pass_message === null) error.message = 'Pass';
          else error.message = pass_message;
        } 
        
        return error;    
      }   
      
      function Check_Radios(radio_group, attrs){
        
                
            /// Find all radios in the group
        var radios = angular.element('input[name="'+radio_group.name+'"]'),
        
            /// Keeps track if there has been a selection made yet
            selection_made = false,
            
            /// An element that the validation message will be inserted after
            validation_container = (radio_group.container === null)
                                    ? radios[radios.length - 1] : document.querySelector(radio_group.container),
            
            /// Validation object
            check = Create_Validation_Obj('pass');
 
        
        /// Check all buttons in group for a selection
        radios.each(function(e){          
          if(this.checked) selection_made = true;
        });
        
        
        /// Set custom pass message
        if(radio_group.pass_message !== null) check.message = radio_group.pass_message;
        
        
        /// Check if a selection was made
        if(selection_made){          
          Create_Validation_Message(validation_container, check, attrs);
        }
        
        
        /// If no selection was made, fail the validation
        else{
          check.pass = false;
          if(radio_group.fail_message === null) check.message = 'No selection made';
          else check.message = radio_group.fail_message;
          Create_Validation_Message(validation_container, check, attrs);
        }  
        
        return check;              
      }   
      
      function Check_Checkboxes(checkbox_group, attrs){

                
        /// Find all checkboxes in the group
        var checkboxes = angular.element('input[name="'+checkbox_group.name+'"]'), 
            
            /// The minimum required to validate
            min_allowed = checkbox_group.min, 
            
            /// The maximum allowed to validate
            max_allowed = checkbox_group.max, 
            
            /// Total number of checkboxes checked
            total_checked = 0, 
            
            /// Determines whether or not a single selection was made
            selection_made = false, 
            
            /// The element passed to the Create_Error_Message function for placement of the validation message
            validation_container = (checkbox_group.container === null)
                                    ? checkboxes[checkboxes.length - 1] : document.querySelector(checkbox_group.container), 
            
            /// The validation object
            check = Create_Validation_Obj(); 
                
        
        /// Check all boxes in group for a selection
        checkboxes.each(function(e){          
          if(this.checked){
            selection_made = true;
            total_checked++;
          } 
        });
        
        
        /// If there was no selection at all it is a fail
        if(!selection_made){
          if(checkbox_group.fail_message === null) check.message = 'No selection made';
          else check.message = checkbox_group.fail_message;
        }
        
        
        /// If a minimum was set, check if it was respected
        else if(min_allowed > 0 && total_checked < min_allowed){                    
          if(checkbox_group.fail_message === null) check.message = 'You must select '+min_allowed;
          else check.message = checkbox_group.fail_message;          
        }
        
        
        /// If a maximum was set, check if it was respected
        else if(max_allowed > 0 && total_checked > max_allowed){
          if(checkbox_group.fail_message === null) check.message = 'You can only select '+max_allowed;
          else check.message = checkbox_group.fail_message;                                          
        }
        
        
        /// Pass the group
        else{
          check.pass = true;
          if(checkbox_group.pass_message === null) check.message = 'pass';          
          else check.message = checkbox_group.pass_message;
        } 
        

        /// Create the validation message
        Create_Validation_Message(validation_container, check, attrs);    
        
        
        return check;           
      }  
      
      function Check_Color_Field(field){
        /// @def - Validates a color field
        
        
        /// Create the validation object
        var error = Create_Validation_Obj(),
            pass_message = (field.hasAttribute('clank-validation-pass')) ? field.getAttribute('clank-validation-pass') : null,
            fail_message = (field.hasAttribute('clank-validation-fail')) ? field.getAttribute('clank-validation-fail') : null;
        
        
        /// Check if the value is empty
        if(field.value === ''){
          if(fail_message === null) error.message = 'You must select a value';
          else error.message = fail_message;
        }
        else if(field.hasAttribute('clank-validation-black-invalid') && field.value === '#000000'){          
          if(fail_message === null) error.message = 'You must select a color';
          else error.message = fail_message;          
        }
        else{
          error.pass = true;          
          if(pass_message === null) error.message = 'Pass';
          else error.message = pass_message;                
        }
        
        return error;
      }  
      
      function Check_File_Field(field){
        /// @def - Validates a file field
        
        
        /// Create the validation object
        var error = Create_Validation_Obj(),
            total_files = field.files.length,
            min_files = (field.hasAttribute('clank-validation-min')) ? field.getAttribute('clank-validation-min') : null,                    
            max_files = (field.hasAttribute('clank-validation-max')) ? field.getAttribute('clank-validation-max') : null,                    
            pass_message = (field.hasAttribute('clank-validation-pass')) ? field.getAttribute('clank-validation-pass') : null,
            fail_message = (field.hasAttribute('clank-validation-fail')) ? field.getAttribute('clank-validation-fail') : null; 
        
        
        /// Check if any files have been uploaded
        if(total_files === 0){          
          if(fail_message === null) error.message = 'You must upload a file';
          else error.message = fail_message;          
        }
        else if(min_files !== null && total_files < min_files){
          if(fail_message === null) error.message = 'You must upload at least '+min_files+' file(s)';
          else error.message = fail_message;                      
        }
        else if (max_files !== null && total_files > max_files){          
          if(fail_message === null) error.message = 'You can only upload '+max_files+' file(s)';
          else error.message = fail_message;            
        }
        else{
          error.pass = true;          
          if(pass_message === null) error.message = 'Pass';
          else error.message = pass_message;
        }
        
        
        return error;
      }   
      
      function Check_Range_Field(field){
        /// @def - Validates a range field
        
        
        /// Create the validation object
        var error = Create_Validation_Obj('pass'),
            pass_message = (field.hasAttribute('clank-validation-pass')) ? field.getAttribute('clank-validation-pass') : null,
            fail_message = (field.hasAttribute('clank-validation-fail')) ? field.getAttribute('clank-validation-fail') : null;
        
        
        /// Check if a custom pass message was declared
        if(pass_message !== null) error.message = pass_message;
        
        
        /// Check if the default value is valid or not
        if(field.hasAttribute('clank-validation-default')){
          if(field.getAttribute('clank-validation-default') === field.value){
            error.pass = false;  
            if(fail_message === null) error.message = 'You must select a value';
            else error.message = fail_message;
          }
        }
        
        
        return error;
      }
      
      function Validate_Field(field, attrs){

      	/// Automatically validate if field is not required
      	if(!field.hasAttribute('required') && !angular.element(field).hasClass('required')){
        	var auto_pass = Create_Validation_Obj('pass');
        	Create_Validation_Message(field, auto_pass, attrs);  	
        	return auto_pass; 
      	} 
      	
      	
      	/// Variables
      	var failed = false, /// used to determine if the field has failed to validate
      	    field_type = Get_Field_Type(field),
      	    check = {}; 


      	/// Check the different field types
      	switch(field_type){
        	case "TEXTAREA":
        	case 'text':
        	case 'email':
        	case 'password':
        	case 'number':
        	case 'tel':
        	case 'search':
        	case 'url':
        	case 'date':
        	case 'datetime-local':
        	case 'month':
        	case 'time':
        	  check = Check_Text_Field(field);    	  
        	  break;
          case 'SELECT':  
            check = Check_Selectbox(field);
            break;
          case 'file':
            check = Check_File_Field(field);
            break;
          case 'color':
            check = Check_Color_Field(field);
            break;
          case 'range':
            check = Check_Range_Field(field);
            break;
          default:
            check = {
              pass:true,
              message:'unknown field type, no check run'
            };
            break;
      	}
      	
      	
      	/// Create the validation message
      	Create_Validation_Message(field, check, attrs);
      	
      	return check;	        
      }
      
      
      /// BINDING FUNCTIONS
      function Bind_Submission_Check(elem, attrs){
        /// @def - Binds validation event to the form submit button
        

            /// Get all fields that are eligible for validation
        var fields = Get_Form_Fields(elem),
            radio_groups = Get_Radio_Groups(elem),
            checkbox_groups = Get_Checkbox_Groups(elem),
            check_list = [],
            submission_element = ('clankValidationButton' in attrs)
                                  ? attrs.clankValidationButton : 'input[type="submit"]';
        
        
        elem.find(submission_element).bind('click', function(e){
          
          
          /// Prevent form from submitting and any browser validation
          e.preventDefault();
          
          
          /// Run validation checks for all eligible fields
          fields.forEach(function(field_item, index, array){
            
            
            /// Run validation check
            check_list.push(Validate_Field(field_item, attrs));
          });
          
                              
          /// Validate radio groups
          radio_groups.forEach(function(e){
            
            
            /// Run validation on all required radio groups
            check_list.push(Check_Radios(e, attrs));
          });
          
          
          /// Validate checkbox groups
          checkbox_groups.forEach(function(e){
            
            
            /// Run validation on all required checkbox groups
            check_list.push(Check_Checkboxes(e, attrs));
          });  
          
          
          /// Submit the form if the check list passes   
          Submit_Form(check_list, elem);               
        });
      }
      
      function Bind_Auto_Validation_Events(elem, attrs){
        /// @def - This function will find all the fields in the form and bind auto-validation events to them
        
        
        /// Variables
        var fields = Get_Form_Fields(elem),
            radio_groups = Get_Radio_Groups(elem),
            checkbox_groups = Get_Checkbox_Groups(elem);
                    
        
        /// Go through each field and bind an event to them      
        fields.forEach(function(field_item, index, array){
          switch(field_item.type){
          	case "textarea":
          	case 'text':
          	case 'email':
          	case 'password':
          	case 'number':
          	case 'tel':
          	case 'search':
          	case 'url':
          	case 'date':
          	case 'datetime-local':
          	case 'month':
          	case 'time':               
              elem.find(field_item).on('change', function(){                  
                  Validate_Field(field_item, attrs);                                                                        
              });              
              break;
            case 'select-one':  
              
              /// Check for clank_selectbox support
              if(field_item.hasAttribute('clank-selectbox')){
                
                
                /// Grab clank-selectbox
                var clank_select = field_item.previousSibling,
                    options = clank_select.getElementsByTagName('li');
                
                
                /// Bind click events to the options
                angular.element(options).on('click', function(e){
                  
                  
                  /// Get validation result
                  var check = Check_Selectbox(field_item);  
                  
                  
                  /// Create the validation message  
                  Create_Validation_Message(field_item, check, attrs);                                                                  
                });
              }
              
              /// If native selectbox is being used
              else{
                angular.element('body').on('change', field_item, function(){
                  
                  /// Get validation result
                  var check = Check_Selectbox(field_item);  
                  
                  
                  /// Create the validation message  
                  Create_Validation_Message(field_item, check, attrs);                                                
                });                
              }
              break;
            case 'file':
              //check = Check_File_Field(field);
              break;
            case 'color':                                          
              angular.element(field_item).on('change', function(e){
                
                /// Get validation result
                var check = Check_Color_Field(field_item);
                
                /// Create the validation message  
                Create_Validation_Message(field_item, check, attrs);                  
              });
              break;
            case 'range':
              angular.element(field_item).on('change', function(e){
                
                /// Get validation result
                var check = Check_Range_Field(field_item);
                
                /// Create the validation message  
                Create_Validation_Message(field_item, check, attrs);                  
              });              
              break;              
            default:break;
          }
        });
        
        
        /// Validate radio groups
        radio_groups.forEach(function(e){
          
          
          /// Cache the group object
          var this_group = e;
          
          
          /// Bind the radio buttons of this group to a change event
          angular.element('input[type="radio"][name="'+e.name+'"]').on('change', function(i){
            
            
            /// Run validation check
            Check_Radios(this_group, attrs);
          });
        });        
        
        
        /// Validate checkbox groups
        checkbox_groups.forEach(function(e){
          
          
          /// Cache this group object
          var this_group = e;
          
          
          /// Bind the checkboxes of this group to a change event
          angular.element('input[type="checkbox"][name="'+e.name+'"]').on('change', function(i){
            
            
            /// Run validation check
            Check_Checkboxes(this_group, attrs);
          });
        });
        
      }
      
      
      
      /*
      //
      /// Return */
      
      return{
        restrict:'A',
        link:function(scope, elem, attrs){
          
 
          /*
          //
          /// Run */
          
          /// Bind validation check to the form submission button
          Bind_Submission_Check(elem, attrs);
          
          
          /// If auto-validation is enabled bind the events to the fields
          if('clankValidationAutoValidate' in attrs && attrs.clankValidationAutoValidate === "true"){
            Bind_Auto_Validation_Events(elem, attrs);
          }          
        }
      };
    });  
})();