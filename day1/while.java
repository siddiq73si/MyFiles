//Simple example if while loop
//Entry control loop
class Example{
	public static void main(String args[])
	{
		int n=5;int i=1;
		while(n>=i)
		{
			
			System.out.println("CountA is "+i);
			
			i++;		//if Increment is not declared,program executed when condition is false.it not possible.so program runs continuesly "CountA is 1".
			break;
		}
		System.out.println("CountB is "+i);
	}

}

//Simple program of while loop with break statement
class ExamplewithBreak{
	public static void main(String args[])
	{
		int n=5;int i=1;
		while(n>=i)
		{
			System.out.println("CountA is "+i);
			i++;
			break;
		}
		System.out.println("CountB is "+i);
	}

}
