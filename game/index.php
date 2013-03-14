<?php

$client = new MongoClient();

$db = $client->toss;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $db->rating->save($_POST);
} else {
    $cursor = $db->rating->find();
    $cursor->sort(array('score' => -1));
    $cursor->limit(10);

    $result = array();

    foreach ($cursor as $row) {
        $result[] = $row;
    }

    echo json_encode($result);
}

if(isset($_GET['reset'])) {
    $db->rating->remove();
}