<?php

function get_input()
{
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        return filter_input_array(INPUT_POST, array(
            'name' => FILTER_SANITIZE_STRING | FILTER_SANITIZE_MAGIC_QUOTES,
            'points' => FILTER_SANITIZE_NUMBER_INT,
            'time' => FILTER_SANITIZE_NUMBER_INT,
        ));
    }
}

function init_db()
{
    $exists = file_exists('score.db');
    $sqlite = new SQLite3('score.db');

    if (!$exists) {
        $sqlite->exec('CREATE TABLE score (name text, points int, time int)');
    }

    return $sqlite;
}

function insert_db($sqlite, $input)
{
    $stmt = $sqlite->prepare('INSERT INTO score (name, points, time)' .
                             ' VALUES (:name, :points, :time)');
    $stmt->bindValue(':name', $input['name'], SQLITE3_TEXT);
    $stmt->bindValue(':points', $input['points'], SQLITE3_INTEGER);
    $stmt->bindValue(':time', $input['time'], SQLITE3_INTEGER);
    $a = $stmt->execute();
}

function parse_db($sqlite)
{
    $points = array();
    $result = $sqlite->query('SELECT DISTINCT * FROM score' .
                            ' WHERE points > 0' .
                            ' ORDER by points DESC, time DESC' .
                            ' LIMIT 25');

    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $points[] = $row;
    }

    return $points;
}

function build_new($input)
{
    $sqlite = init_db();
    insert_db($sqlite, $input);
    $sqlite->close();
}

function build_points()
{
    $sqlite = init_db();
    $points = parse_db($sqlite);
    $sqlite->close();

    return $points;
}

function build_response($points)
{
    ob_start();
    include 'score.phtml';
    $return = ob_get_contents();
    ob_end_clean();

    return $return;
}

function main()
{
    $input = get_input();

    if ($input !== null) {
        build_new($input);

        header('Location: score.php');
    } else {
        $points = build_points();
        $return = build_response($points);

        print($return);
    }
}

main();
