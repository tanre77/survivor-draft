package com.tanre77.survivordraft;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        int bg = getColor(R.color.bg);
        int fg = getColor(R.color.fg);
        int muted = getColor(R.color.muted);
        int toka = getColor(R.color.toka);
        int boot = getColor(R.color.boot);

        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(bg);
        LinearLayout column = new LinearLayout(this);
        column.setOrientation(LinearLayout.VERTICAL);
        column.setBackgroundColor(bg);
        int pad = dp(20);
        column.setPadding(pad, pad, pad, pad);
        scroll.addView(column);

        TextView title = new TextView(this);
        title.setText("Survivor 51");
        title.setTextColor(fg);
        title.setTextSize(34);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        column.addView(title);

        TextView note = new TextView(this);
        note.setText("Lowest score leads. A boot stays off the score until 9:30pm Eastern. The buy-in is settled outside the app.");
        note.setTextColor(muted);
        note.setTextSize(14);
        note.setPadding(0, dp(8), 0, dp(16));
        column.addView(note);

        try {
            Board board = Board.load(this);
            for (Board.Seat seat : board.ranked()) {
                TextView row = new TextView(this);
                row.setText(seat.line());
                row.setTextColor(seat.leading ? toka : fg);
                row.setTextSize(16);
                row.setPadding(0, dp(10), 0, dp(10));
                column.addView(row);
            }
            for (String line : board.latestLines()) {
                TextView banner = new TextView(this);
                banner.setText(line);
                banner.setTextColor(fg);
                banner.setBackgroundColor(boot);
                banner.setTextSize(16);
                banner.setTypeface(Typeface.DEFAULT_BOLD);
                banner.setPadding(pad, dp(10), pad, dp(10));
                column.addView(banner);
            }
        } catch (Exception error) {
            TextView fail = new TextView(this);
            fail.setText("The board could not be read.");
            fail.setTextColor(boot);
            column.addView(fail);
        }

        setContentView(scroll);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
