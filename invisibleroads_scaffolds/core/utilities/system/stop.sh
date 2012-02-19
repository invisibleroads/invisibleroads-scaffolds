for pid in `ps x | grep production.ini | grep -v grep | awk '{print $1}'`; do
    kill $pid
done
