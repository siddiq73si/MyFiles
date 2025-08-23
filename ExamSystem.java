import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class ExamSystem extends JFrame implements ActionListener {

    // Components
    JLabel questionLabel;
    JRadioButton option1, option2, option3, option4;
    JButton nextButton, submitButton;
    ButtonGroup bg;
    
    // Data
    String[] questions = {
            "1. Which is the capital of India?",
            "2. Who invented Java?",
            "3. Which one is not OOPS concept?",
            "4. Which company owns Java?",
            "5. Which keyword is used to inherit a class?"
    };
    
    String[][] options = {
            {"Delhi", "Mumbai", "Kolkata", "Chennai"},
            {"James Gosling", "Dennis Ritchie", "Bjarne Stroustrup", "Guido van Rossum"},
            {"Encapsulation", "Polymorphism", "Compilation", "Inheritance"},
            {"Microsoft", "Oracle", "Google", "IBM"},
            {"super", "this", "extends", "final"}
    };
    
    String[] answers = {"Delhi", "James Gosling", "Compilation", "Oracle", "extends"};
    
    int index = 0, correctCount = 0;

    ExamSystem() {
        setTitle("Exam System - Java Swing");
        setSize(600, 400);
        setLayout(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        questionLabel = new JLabel();
        questionLabel.setBounds(50, 50, 500, 30);
        add(questionLabel);

        option1 = new JRadioButton();
        option1.setBounds(50, 100, 200, 30);
        add(option1);

        option2 = new JRadioButton();
        option2.setBounds(50, 140, 200, 30);
        add(option2);

        option3 = new JRadioButton();
        option3.setBounds(50, 180, 200, 30);
        add(option3);

        option4 = new JRadioButton();
        option4.setBounds(50, 220, 200, 30);
        add(option4);

        bg = new ButtonGroup();
        bg.add(option1);
        bg.add(option2);
        bg.add(option3);
        bg.add(option4);

        nextButton = new JButton("Next");
        nextButton.setBounds(100, 280, 100, 30);
        nextButton.addActionListener(this);
        add(nextButton);

        submitButton = new JButton("Submit");
        submitButton.setBounds(250, 280, 100, 30);
        submitButton.addActionListener(this);
        submitButton.setEnabled(false);
        add(submitButton);

        loadQuestion();

        setVisible(true);
    }

    // Load next question
    void loadQuestion() {
        if (index < questions.length) {
            questionLabel.setText(questions[index]);
            option1.setText(options[index][0]);
            option2.setText(options[index][1]);
            option3.setText(options[index][2]);
            option4.setText(options[index][3]);
            bg.clearSelection();
        }
    }

    // Check answer
    void checkAnswer() {
        String selected = null;
        if (option1.isSelected()) selected = option1.getText();
        else if (option2.isSelected()) selected = option2.getText();
        else if (option3.isSelected()) selected = option3.getText();
        else if (option4.isSelected()) selected = option4.getText();

        if (selected != null && selected.equals(answers[index])) {
            correctCount++;
        }
    }

    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == nextButton) {
            checkAnswer();
            index++;
            if (index == questions.length - 1) {
                nextButton.setEnabled(false);
                submitButton.setEnabled(true);
            }
            loadQuestion();
        } else if (e.getSource() == submitButton) {
            checkAnswer();
            JOptionPane.showMessageDialog(this, "You scored " + correctCount + " out of " + questions.length);
            System.exit(0);
        }
    }

    public static void main(String[] args) {
        new ExamSystem();
    }
}
