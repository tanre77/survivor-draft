package com.tanre77.survivordraft;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ScrollView scroll = new ScrollView(this);
        LinearLayout column = new LinearLayout(this);
        column.setOrientation(LinearLayout.VERTICAL);
        int pad = dp(20);
        column.setPadding(pad, pad, pad, pad);
        scroll.addView(column);

        TextView title = new TextView(this);
        title.setText("Survivor 51");
        title.setTextColor(Color.parseColor("#F4EFE6"));
        title.setTextSize(34);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        column.addView(title);

        TextView note = new TextView(this);
        note.setText("Lowest score leads. The buy-in is settled outside the app.");
        note.setTextColor(Color.parseColor("#A89886"));
        note.setTextSize(14);
        note.setPadding(0, dp(8), 0, dp(16));
        column.addView(note);

        try {
            Board board = Board.load(this);
            for (Board.Seat seat : board.ranked()) {
                TextView row = new TextView(this);
                row.setText(seat.line());
                row.setTextColor(seat.leading ? Color.parseColor("#E2B340") : Color.parseColor("#F4EFE6"));
                row.setTextSize(16);
                row.setPadding(0, dp(10), 0, dp(10));
                column.addView(row);
            }
        } catch (Exception error) {
            TextView fail = new TextView(this);
            fail.setText("The board could not be read.");
            fail.setTextColor(Color.parseColor("#E10600"));
            column.addView(fail);
        }

        setContentView(scroll);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
