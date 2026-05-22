<?php
require __DIR__ . '/vendor/autoload.php';

$manager = new \Intervention\Image\ImageManager(
    new \Intervention\Image\Drivers\Gd\Driver()
);

echo implode(', ', get_class_methods($manager));
