Clank Validation is an AngularJS module to supply client-side form validation. Clank Validation currently supports the follow list of field types:
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

To initialize Clank Validation on a form add the "clank-validation" attribute to a <form> element.
```html
<form clank-validation></form>
```

To use a custom module classname, instead of 'clank_validation', give the clank-validation attribute a value.
```html
<form clank-validation="error_message"></form>
```

You may specify the button that triggers the validation, in case you have multiple input[type="submit"] or your unique case requires it, by using the "clank-validation-button" and passing it a selector value. It is important to note that the button must be inside of the form for it to work.
```html
<form clank-validation clank-validation-button="#submit">
```

You can create custom pass/fail messages by using the attributes "clank-validation-fail" & "clank-validation-pass".
```html
<input type="text" clank-validation-fail="Please choose a browser" clank-validation-pass="Correct!" required>
```

You may specify a min/max character limit on all textboxes using the "clank-validation-min" and "clank-validation-max" attributes on the given input.
```html
<input type="text" clank-validation-min="5" clank-validation-max="15" required>
```

Selectboxes can specify if whether or not the default answer is invalid or not using the "clank-validation-default" attribute.
```html
<select clank-validation-default="invalid" required>```
  

Checkboxes can specify whether they have a minimum or maximum requirement by setting the "clank-validation-min" or "clank-validation-max" attribute on the first checkbox in the group.
```html
<input type="checkbox" name="checkbox_group" value="example" clank-validation-min="2" clank-validation-max="4" required>```
  

Checkboxes and radio buttons can specify where the error message should be inserted in the DOM using the "clank-validation-insert-after" attribute on the first item in the group and passing  it a selector value. It's important to note that this will not have the <validation-message> printed  within the given selector, but inserted immediately after the qualified element. 
```html
<input type="checkbox" name="checkbox_group" value="example" clank-validation-insert-after=".any_selector_type" required>```
  

Color fields have the ability for you to declare black as invalid using the "clank-validation-black-invalid" attribute.
```html
<input type="color" clank-validation-black-invalid="true" required>```
  
Range fields can be have their default value specified to be invalid by applying the "clank-validation-default" attribute to the range input. 
```html
<input type="range" value="0" min="0" max="10" clank-validation-default="0" required>```



@remember - The validation looks for the 'required' attribute, as well, 
            a 'required' class on field items within a form.

@remember - Transition attribute starts as "paused" and goes to "play".

@remember - Status attribute allows for styling of message types

@remember - This module relies on checkValidity() which is not supported in IE9

@remember - If any radio button or checkbox in it's group has a required the group will be validated

@remember - The first checkbox/radio button in the group is the one that needs the attributes 

@remember - Auto-validation does not work for file fields  
  
  


  
