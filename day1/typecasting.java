//Automatic Type Casting
class Casting
{
	public static void main(String args[])
	{
		int a=10;
		long b;
		b=a;
		System.out.println(b);
	}
}

//Automatic Type Casting(int--->float,float is higher than int)
class Casting1
{
	public static void main(String args[])
	{
		int a=70;
		float b;
		b=a;
		System.out.println(b);
	}
}

//Incompatible Type Casting(int--->byte byte is smaller than int)
class TypeCasting
{
	public static void main(String args[])
	{
		int a=70;
		byte b;
		b=(byte)a;
		System.out.println(b);
	}
}

//Incompatible Type Casting(int--->byte,byte is smaller than int and byte range -128 to 127)
class TypeCasting1
{
	public static void main(String args[])
	{
		int a=255;
		byte b;
		b=(byte)a;
		System.out.println(b);
	}
}

