tokens.php is a small utility script to generate JSON Web Tokens (JWT).
My goal with this is just to start playing around with JWTs (generation/signature/validation).

The script depends on multiple 3rd party PHP libraries. Those are listed in the `composer.json` configuration file.

If modifications are needed in the dependencies (e.g., version update) then [composer](https://getcomposer.org/) must be used:
* make any modifications needed to the composer.json file (never modify the contents of the 'vendor' folder)
* execute `composer install` or `composer update`

If new dependencies are needed, just run `composer require`...

And RTFM :)
